import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { DomainError } from '../../common/error/domain.error';
import { ErrorCode } from '../../common/error/error-code';
import {
  CreateCredentialIssueRequestResult,
  CredentialDetailResult,
  CredentialIssueRequestResult,
  CredentialSubmissionItemResult,
  CredentialSummaryResult,
  IssuePipelineStageItemResult,
  ListCredentialSubmissionsResult,
  ListCredentialsResult,
  SubmitCredentialResult,
} from '../dto/credential.result';
import { Credential } from '../entity/credential.entity';
import { CredentialIssueRequest } from '../entity/credential-issue-request.entity';
import { CredentialSubmission } from '../entity/credential-submission.entity';
import { CredentialIssueRequestStatus } from '../enum/credential-issue-request-status.enum';
import { CredentialStatus } from '../enum/credential-status.enum';
import { CredentialSubmissionStatus } from '../enum/credential-submission-status.enum';
import {
  issuePipelineStageLabels,
  issuePipelineStages,
  IssuePipelineStage,
} from '../enum/issue-pipeline-stage.enum';
import { IssuePipelineStageStatus } from '../enum/issue-pipeline-stage-status.enum';
import { CredentialDocumentTypeRepository } from '../repository/credential-document-type.repository';
import { CredentialRepository } from '../repository/credential.repository';
import { XrplCredentialAdapter } from '../contract/xrpl-credential-adapter';
import { XrplCredentialTransactionEvidenceResult } from '../dto/xrpl-credential-evidence.result';

@Injectable()
export class CredentialService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly credentialDocumentTypeRepository: CredentialDocumentTypeRepository,
    private readonly xrplCredentialAdapter?: XrplCredentialAdapter,
  ) {}

  async createIssueRequest(
    userId: bigint,
    documentTypeId: string,
    documentId: string | null,
    authEventId: string | null,
    walletAddress: string,
  ): Promise<CreateCredentialIssueRequestResult> {
    const documentType = await this.credentialDocumentTypeRepository.findActiveByCode(documentTypeId);
    if (documentType === null) {
      throw new DomainError(ErrorCode.Credential.DOCUMENT_TYPE_NOT_FOUND, { documentTypeId });
    }

    const now = new Date();
    const request = await this.credentialRepository.createIssueRequest({
      issueRequestCode: randomUUID(),
      userId,
      documentTypeCode: documentType.code,
      documentId,
      status: CredentialIssueRequestStatus.ISSUED,
      currentStage: IssuePipelineStage.ISSUED,
      currentSubstep: null,
      authEventId,
      requestedAt: now,
    });

    const expiresAt = addMonths(now, documentType.defaultTtlMonths);
    let xrplEvidence: XrplCredentialTransactionEvidenceResult | null;
    try {
      xrplEvidence = await this.publishTestnetCredentialEvidence(
        walletAddress,
        documentType.code,
        request.issueRequestCode,
        expiresAt,
      );
    } catch (error) {
      await this.credentialRepository.markIssueRequestFailed({
        issueRequestId: request.id,
        failedAt: new Date(),
        failureReason: this.toFailureReason(error),
      });
      throw error;
    }

    const credential = await this.credentialRepository.createCredential({
      credentialCode: randomUUID(),
      issueRequestId: request.id,
      issueRequestCode: request.issueRequestCode,
      userId,
      documentTypeCode: documentType.code,
      documentTypeName: documentType.name,
      issuerCode: documentType.issuerCode,
      status: CredentialStatus.ISSUED,
      walletAddress,
      isMock: xrplEvidence === null,
      xrplCredentialId: xrplEvidence === null
        ? `mock:${request.issueRequestCode}`
        : this.buildXrplCredentialIdentity(xrplEvidence),
      xrplNetwork: xrplEvidence?.network ?? null,
      xrplIssuerAddress: xrplEvidence?.issuer ?? null,
      xrplSubjectAddress: xrplEvidence?.subject ?? null,
      xrplCredentialType: xrplEvidence?.credentialType ?? null,
      xrplTxHash: xrplEvidence?.transactionHash ?? null,
      xrplLedgerIndex: xrplEvidence?.ledgerIndex ?? null,
      xrplEngineResult: xrplEvidence?.engineResult ?? null,
      xrplValidated: xrplEvidence?.validated ?? null,
      sourceDocumentRef: documentId,
      authEventId,
      issuedAt: now,
      expiresAt,
    });

    if (xrplEvidence !== null) {
      await this.credentialRepository.createXrplTransaction({
        credentialId: credential.id,
        evidence: xrplEvidence,
      });
    }

    return this.toIssueRequestCreateResult(request);
  }

  async getIssueRequest(
    userId: bigint,
    issueRequestId: string,
  ): Promise<CredentialIssueRequestResult> {
    const request = await this.loadOwnedIssueRequest(userId, issueRequestId);
    const credential = await this.credentialRepository.findCredentialByIssueRequestId(request.id);
    const submissionCount = await this.credentialRepository.countSubmissionsByIssueRequestId(request.id);

    return new CredentialIssueRequestResult(
      request.issueRequestCode,
      request.status,
      this.buildPipeline(request.currentStage, request.status, request.currentSubstep),
      request.currentStage,
      request.currentSubstep,
      request.authEventId,
      credential?.credentialCode ?? null,
      submissionCount,
    );
  }

  async listCredentials(userId: bigint, status?: CredentialStatus): Promise<ListCredentialsResult> {
    const credentials = await this.credentialRepository.listCredentialsByUserId(userId, status);
    return new ListCredentialsResult(credentials.map((credential) => this.toCredentialSummaryResult(credential)));
  }

  async getCredentialDetail(userId: bigint, credentialId: string): Promise<CredentialDetailResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    const submissions = await this.credentialRepository.listSubmissionsByCredentialId(credential.id);

    return new CredentialDetailResult(
      this.toCredentialSummaryResult(credential),
      this.buildPipeline(IssuePipelineStage.ISSUED, CredentialIssueRequestStatus.ISSUED, null),
      submissions.map((submission) => this.toSubmissionItemResult(submission)),
      credential.sourceDocumentRef,
    );
  }

  async submitCredential(
    userId: bigint,
    credentialId: string,
    submissionRequestId: string,
    consentConfirmed: boolean,
    authEventId: string | null,
  ): Promise<SubmitCredentialResult> {
    if (!consentConfirmed) {
      throw new DomainError(ErrorCode.Credential.CONSENT_REQUIRED, { credentialId });
    }

    const credential = await this.loadOwnedCredential(userId, credentialId);
    this.assertSubmittable(credential);

    const submittedAt = new Date();
    const submission = await this.credentialRepository.createSubmission({
      submissionCode: randomUUID(),
      credentialId: credential.id,
      credentialCode: credential.credentialCode,
      userId,
      submissionRequestId,
      recipientInstitutionId: submissionRequestId,
      recipientInstitutionName: submissionRequestId,
      status: CredentialSubmissionStatus.RECEIVED,
      authEventId,
      submittedAt,
    });

    return new SubmitCredentialResult(
      submission.submissionCode,
      submission.credentialCode,
      submission.recipientInstitutionId,
      submission.status,
      submission.submittedAt,
      submission.authEventId,
    );
  }

  async listSubmissions(userId: bigint, credentialId?: string): Promise<ListCredentialSubmissionsResult> {
    if (credentialId !== undefined) {
      const credential = await this.loadOwnedCredential(userId, credentialId);
      const submissions = await this.credentialRepository.listSubmissionsByCredentialId(credential.id);
      return new ListCredentialSubmissionsResult(submissions.map((submission) => this.toSubmissionItemResult(submission)));
    }

    const submissions = await this.credentialRepository.listSubmissionsByUserId(userId);
    return new ListCredentialSubmissionsResult(submissions.map((submission) => this.toSubmissionItemResult(submission)));
  }


  private async publishTestnetCredentialEvidence(
    subjectAddress: string,
    documentTypeCode: string,
    issueRequestCode: string,
    expiresAt: Date,
  ): Promise<XrplCredentialTransactionEvidenceResult | null> {
    if (this.xrplCredentialAdapter === undefined) {
      return null;
    }

    try {
      return await this.xrplCredentialAdapter.submitCredentialCreate({
        issuerAddress: this.xrplCredentialAdapter.getIssuerAddress(),
        subjectAddress,
        credentialTypeHex: this.buildCredentialTypeHex(documentTypeCode),
        expiration: this.xrplCredentialAdapter.toXrplExpiration(expiresAt),
        uri: `myapo://credentials/${issueRequestCode}`,
      });
    } catch (error) {
      if (error instanceof DomainError && error.errorCode === ErrorCode.Credential.XRPL_CONFIG_MISSING) {
        return null;
      }
      throw error;
    }
  }

  private buildCredentialTypeHex(documentTypeCode: string): string {
    return createHash('sha256').update(documentTypeCode).digest('hex').toUpperCase();
  }

  private buildXrplCredentialIdentity(evidence: XrplCredentialTransactionEvidenceResult): string {
    return `${evidence.issuer}:${evidence.subject}:${evidence.credentialType}`;
  }

  private toFailureReason(error: unknown): string {
    if (error instanceof DomainError) {
      return error.errorCode.code;
    }
    if (error instanceof Error && error.message.length > 0) {
      return error.message;
    }
    return 'UNKNOWN_CREDENTIAL_ISSUE_FAILURE';
  }

  private async loadOwnedIssueRequest(userId: bigint, issueRequestCode: string): Promise<CredentialIssueRequest> {
    const request = await this.credentialRepository.findIssueRequestByCode(issueRequestCode);
    if (request === null) {
      throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND, { issueRequestId: issueRequestCode });
    }
    if (request.userId !== userId) {
      throw new DomainError(ErrorCode.Credential.NOT_OWNED, { issueRequestId: issueRequestCode });
    }
    return request;
  }

  private async loadOwnedCredential(userId: bigint, credentialCode: string): Promise<Credential> {
    const credential = await this.credentialRepository.findCredentialByCode(credentialCode);
    if (credential === null) {
      throw new DomainError(ErrorCode.Credential.NOT_FOUND, { credentialId: credentialCode });
    }
    if (credential.userId !== userId) {
      throw new DomainError(ErrorCode.Credential.NOT_OWNED, { credentialId: credentialCode });
    }
    return credential;
  }

  private assertSubmittable(credential: Credential): void {
    if (credential.status === CredentialStatus.EXPIRED || credential.expiresAt.getTime() <= Date.now()) {
      throw new DomainError(ErrorCode.Credential.EXPIRED, { credentialId: credential.credentialCode });
    }
    if (credential.status === CredentialStatus.REVOKED) {
      throw new DomainError(ErrorCode.Credential.REVOKED, { credentialId: credential.credentialCode });
    }
    if (credential.status !== CredentialStatus.ISSUED) {
      throw new DomainError(ErrorCode.Credential.NOT_SUBMITTABLE, { credentialId: credential.credentialCode });
    }
  }

  private toIssueRequestCreateResult(request: CredentialIssueRequest): CreateCredentialIssueRequestResult {
    return new CreateCredentialIssueRequestResult(
      request.issueRequestCode,
      request.status,
      this.buildPipeline(request.currentStage, request.status, request.currentSubstep),
      request.currentStage,
      request.currentSubstep,
      request.authEventId,
    );
  }

  private buildPipeline(
    currentStage: IssuePipelineStage,
    requestStatus: CredentialIssueRequestStatus,
    currentSubstep: string | null,
  ): IssuePipelineStageItemResult[] {
    const currentIndex = issuePipelineStages.indexOf(currentStage);
    return issuePipelineStages.map((stage, index) => {
      const status = requestStatus === CredentialIssueRequestStatus.FAILED && stage === currentStage
        ? IssuePipelineStageStatus.FAILED
        : index < currentIndex || requestStatus === CredentialIssueRequestStatus.ISSUED
          ? IssuePipelineStageStatus.DONE
          : index === currentIndex
            ? IssuePipelineStageStatus.ACTIVE
            : IssuePipelineStageStatus.PENDING;
      return new IssuePipelineStageItemResult(
        stage,
        issuePipelineStageLabels[stage],
        status,
        stage === currentStage ? currentSubstep : null,
      );
    });
  }

  private toCredentialSummaryResult(credential: Credential): CredentialSummaryResult {
    return new CredentialSummaryResult(
      credential.credentialCode,
      credential.issueRequestCode,
      credential.documentTypeCode,
      credential.documentTypeName,
      credential.issuerCode,
      credential.status,
      credential.issuedAt,
      credential.expiresAt,
      credential.walletAddress,
      credential.isMock,
      credential.xrplNetwork,
      credential.xrplTxHash,
      credential.xrplLedgerIndex,
      credential.xrplEngineResult,
      credential.xrplValidated,
      credential.xrplCredentialType,
    );
  }

  private toSubmissionItemResult(submission: CredentialSubmission): CredentialSubmissionItemResult {
    return new CredentialSubmissionItemResult(
      submission.submissionCode,
      submission.credentialCode,
      submission.recipientInstitutionId,
      submission.recipientInstitutionName,
      submission.status,
      submission.rejectionReason,
      submission.submittedAt,
      submission.authEventId,
    );
  }
}

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};
