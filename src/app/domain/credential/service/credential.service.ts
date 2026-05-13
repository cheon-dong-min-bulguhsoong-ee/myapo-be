import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import {
  CreateCredentialIssueRequestResult,
  CredentialIssuePipelineStageResult,
  CredentialDetailResult,
  CredentialIssueRequestResult,
  CredentialSubmissionItemResult,
  CredentialSummaryResult,
  ListCredentialsByIssuePipelineStageResult,
  IssuePipelineStageItemResult,
  ListCredentialSubmissionsResult,
  ListCredentialsResult,
  SubmitCredentialResult,
} from "../dto/credential.result";
import { CredentialIssuePipelineState } from "../enum/credential-issue-pipeline-state.enum";
import { Credential } from "../entity/credential.entity";
import { CredentialIssueRequest } from "../entity/credential-issue-request.entity";
import { CredentialSubmission } from "../entity/credential-submission.entity";
import { CredentialIssueRequestStatus } from "../enum/credential-issue-request-status.enum";
import { CredentialStatus } from "../enum/credential-status.enum";
import { CredentialSubmissionStatus } from "../enum/credential-submission-status.enum";
import { XrplCredentialDeleteSubmitterRole } from "../enum/xrpl-credential-delete-submitter-role.enum";
import {
  issuePipelineStageLabels,
  issuePipelineStages,
  IssuePipelineStage,
} from "../enum/issue-pipeline-stage.enum";
import { IssuePipelineStageStatus } from "../enum/issue-pipeline-stage-status.enum";
import { CredentialDocumentStageLookupRepository } from "../repository/credential-document-stage-lookup.repository";
import { CredentialDocumentTypeRepository } from "../repository/credential-document-type.repository";
import { CredentialRepository } from "../repository/credential.repository";
import { XrplCredentialAdapter } from "../contract/xrpl-credential-adapter";
import {
  XrplCredentialTransactionEvidenceResult,
  XrplCredentialTransactionKind,
} from "../dto/xrpl-credential-evidence.result";
import { XrplCredentialTransactionPayloadResult } from "../dto/xrpl-credential-transaction-payload.result";

@Injectable()
export class CredentialService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly credentialDocumentTypeRepository: CredentialDocumentTypeRepository,
    private readonly credentialDocumentStageLookupRepository: CredentialDocumentStageLookupRepository,
    private readonly xrplCredentialAdapter?: XrplCredentialAdapter,
  ) {}

  async createIssueRequest(
    userId: bigint,
    documentTypeId: string,
    documentCode: string,
    currentStage: IssuePipelineStage,
    walletAddress: string,
  ): Promise<CreateCredentialIssueRequestResult> {
    const documentType =
      await this.credentialDocumentTypeRepository.findActiveByCode(
        documentTypeId,
      );
    if (documentType === null) {
      throw new DomainError(ErrorCode.Credential.DOCUMENT_TYPE_NOT_FOUND, {
        documentTypeId,
      });
    }

    const xrplUri = await this.resolveXrplUri(documentCode, currentStage);

    const now = new Date();
    const request = await this.credentialRepository.createIssueRequest({
      issueRequestCode: randomUUID(),
      userId,
      documentTypeCode: documentType.code,
      documentCode,
      status: CredentialIssueRequestStatus.ISSUED,
      currentStage,
      requestedAt: now,
    });

    const expiresAt = addMonths(now, documentType.defaultTtlMonths);
    try {
      const xrplEvidence = await this.publishTestnetCredentialEvidence(
        walletAddress,
        currentStage,
        expiresAt,
        xrplUri,
      );
      const credential = await this.credentialRepository.createCredential({
        credentialCode: randomUUID(),
        issueRequestId: request.id,
        userId,
        documentCode: request.documentCode,
        documentTypeCode: documentType.code,
        documentTypeName: documentType.name,
        issuerCode: documentType.issuerCode,
        status: CredentialStatus.CREATED,
        currentStage: request.currentStage,
        issuedAt: now,
        expiresAt,
      });

      const createdXrplTransactionId =
        await this.credentialRepository.createXrplTransaction({
          credentialId: credential.id,
          evidence: xrplEvidence,
        });
      await this.credentialRepository.updateCredentialCreatedXrplTransaction({
        credentialId: credential.id,
        createdXrplTransactionId,
      });

      return this.toIssueRequestCreateResult(request, credential.credentialCode);
    } catch (error) {
      await this.credentialRepository.markIssueRequestFailed({
        issueRequestId: request.id,
        failedAt: new Date(),
        failureReason: this.toFailureReason(error),
      });
      throw error;
    }
  }

  async getIssueRequest(
    userId: bigint,
    issueRequestId: string,
  ): Promise<CredentialIssueRequestResult> {
    const request = await this.loadOwnedIssueRequest(userId, issueRequestId);
    const credential =
      await this.credentialRepository.findCredentialByIssueRequestId(
        request.id,
      );
    const submissionCount =
      await this.credentialRepository.countSubmissionsByIssueRequestId(
        request.id,
      );

    return new CredentialIssueRequestResult(
      request.issueRequestCode,
      request.status,
      this.buildPipeline(request.currentStage, request.status, request.isSuspended),
      request.currentStage,
      request.isSuspended,
      credential?.credentialCode ?? null,
      submissionCount,
    );
  }

  async listCredentials(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<ListCredentialsResult> {
    const credentials = await this.credentialRepository.listCredentialsByUserId(
      userId,
      status,
    );
    return new ListCredentialsResult(
      credentials.map((credential) =>
        this.toCredentialSummaryResult(credential),
      ),
    );
  }

  /**
   * 발급 요청을 일시 중지한다.
   */
  async suspendIssueRequest(issueRequestCode: string): Promise<void> {
    const request = await this.credentialRepository.findIssueRequestByCode(issueRequestCode);
    if (!request) throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND);
    await this.credentialRepository.updateIssueRequestSuspension(request.id, true);
  }

  /**
   * 발급 요청을 재개한다.
   */
  async resumeIssueRequest(issueRequestCode: string): Promise<void> {
    const request = await this.credentialRepository.findIssueRequestByCode(issueRequestCode);
    if (!request) throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND);
    await this.credentialRepository.updateIssueRequestSuspension(request.id, false);
  }

  async listCredentialsByIssuePipelineStage(
    userId: bigint,
    currentStage: string,
  ): Promise<ListCredentialsByIssuePipelineStageResult> {
    const normalizedCurrentStage = this.normalizeCredentialCurrentStage(
      currentStage,
    );
    const credentials =
      await this.credentialRepository.listCredentialsByUserIdAndCurrentStage(
        userId,
        normalizedCurrentStage,
      );
    const results = await Promise.all(
      credentials.map(async (credential) => {
        const credentialState = await this.resolveCredentialLifecycleState(
          credential,
        );
        return new CredentialIssuePipelineStageResult(
          this.toCredentialSummaryResult(credential),
          credentialState,
        );
      }),
    );
    return new ListCredentialsByIssuePipelineStageResult(results);
  }

  private async resolveCredentialLifecycleState(
    credential: Credential,
  ): Promise<CredentialIssuePipelineState> {
    if (credential.status === CredentialStatus.REVOKED) {
      return CredentialIssuePipelineState.REVOKED;
    }
    if (
      credential.status === CredentialStatus.EXPIRED ||
      credential.expiresAt <= new Date()
    ) {
      return CredentialIssuePipelineState.EXPIRED;
    }

    const accepted =
      credential.status === CredentialStatus.ACCEPTED ||
      (await this.credentialRepository.hasCredentialXrplTransaction(
        credential.id,
        XrplCredentialTransactionKind.ACCEPT,
      ));
    return accepted
      ? CredentialIssuePipelineState.ACCEPTED
      : CredentialIssuePipelineState.CREATED;
  }

  private normalizeCredentialCurrentStage(
    currentStage: string,
  ): IssuePipelineStage {
    try {
      const normalized = currentStage.trim();
      if (!issuePipelineStages.includes(normalized as IssuePipelineStage)) {
        throw new Error("invalid-stage");
      }
      return normalized as IssuePipelineStage;
    } catch {
      throw new DomainError(ErrorCode.Common.VALIDATION_ERROR, {
        currentStage,
      });
    }
  }

  async getCredentialDetail(
    userId: bigint,
    credentialId: string,
  ): Promise<CredentialDetailResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    const submissions =
      await this.credentialRepository.listSubmissionsByCredentialId(
        credential.id,
      );

    return new CredentialDetailResult(
      this.toCredentialSummaryResult(credential),
      this.buildPipeline(
        (credential.currentStage as IssuePipelineStage) ??
          IssuePipelineStage.APOSTILLE_DOC_ISSUED,
        CredentialIssueRequestStatus.ISSUED,
      ),
      submissions.map((submission) => this.toSubmissionItemResult(submission)),
    );
  }

  async submitCredential(
    userId: bigint,
    credentialId: string,
    submissionRequestId: string,
    consentConfirmed: boolean,
  ): Promise<SubmitCredentialResult> {
    if (!consentConfirmed) {
      throw new DomainError(ErrorCode.Credential.CONSENT_REQUIRED, {
        credentialId,
      });
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
      submittedAt,
    });

    return new SubmitCredentialResult(
      submission.submissionCode,
      submission.credentialCode,
      submission.recipientInstitutionId,
      submission.status,
      submission.submittedAt,
    );
  }

  async listSubmissions(
    userId: bigint,
    credentialId?: string,
  ): Promise<ListCredentialSubmissionsResult> {
    if (credentialId !== undefined) {
      const credential = await this.loadOwnedCredential(userId, credentialId);
      const submissions =
        await this.credentialRepository.listSubmissionsByCredentialId(
          credential.id,
        );
      return new ListCredentialSubmissionsResult(
        submissions.map((submission) =>
          this.toSubmissionItemResult(submission),
        ),
      );
    }

    const submissions =
      await this.credentialRepository.listSubmissionsByUserId(userId);
    return new ListCredentialSubmissionsResult(
      submissions.map((submission) => this.toSubmissionItemResult(submission)),
    );
  }

  /**
   * 크리덴셜을 취소(Revoke)한다. (Dispute 처리 시 호출됨)
   */
  async revoke(
    credentialCode: string,
  ): Promise<void> {
    const credential =
      await this.credentialRepository.findCredentialByCode(credentialCode);
    if (credential === null) {
      throw new DomainError(ErrorCode.Credential.NOT_FOUND, {
        credentialId: credentialCode,
      });
    }

    if (credential.status === CredentialStatus.REVOKED) {
      return;
    }

    // 1. XRPL 취소 (증적이 있는 경우)
    if (
      this.xrplCredentialAdapter &&
      credential.xrplIssuerAddress !== null &&
      credential.xrplSubjectAddress !== null &&
      credential.xrplCredentialType !== null
    ) {
      const evidence =
        await this.xrplCredentialAdapter.submitCredentialDeleteByIssuer({
          submitterAddress: this.xrplCredentialAdapter.getIssuerAddress(),
          issuerAddress: credential.xrplIssuerAddress,
          subjectAddress: credential.xrplSubjectAddress,
          credentialTypeHex: credential.xrplCredentialType,
        });
      const revokedXrplTransactionId =
        await this.credentialRepository.createXrplTransaction({
        credentialId: credential.id,
        evidence,
      });
      await this.credentialRepository.updateCredentialRevokedXrplTransaction({
        credentialId: credential.id,
        revokedXrplTransactionId,
      });
    }

    // 2. DB 상태 변경
    credential.revoke();
    await this.credentialRepository.updateCredential(credential);
  }

  async prepareAcceptTestnetCredential(
    userId: bigint,
    credentialId: string,
  ): Promise<XrplCredentialTransactionPayloadResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    this.assertTestnetCredentialEvidenceAvailable(credential);
    const xrplCredentialAdapter = this.getXrplCredentialAdapterOrThrow();
    const transaction = xrplCredentialAdapter.buildCredentialAcceptTransaction({
      subjectAddress: credential.xrplSubjectAddress,
      issuerAddress: credential.xrplIssuerAddress,
      credentialTypeHex: credential.xrplCredentialType,
    });

    return new XrplCredentialTransactionPayloadResult(
      XrplCredentialTransactionKind.ACCEPT,
      xrplCredentialAdapter.getNetworkName(),
      transaction as unknown as Record<string, unknown>,
    );
  }

  async acceptTestnetCredential(
    userId: bigint,
    credentialId: string,
    signedTransactionBlob: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    this.assertTestnetCredentialEvidenceAvailable(credential);
    const xrplCredentialAdapter = this.getXrplCredentialAdapterOrThrow();

    const evidence = await xrplCredentialAdapter.submitCredentialAccept({
      subjectAddress: credential.xrplSubjectAddress,
      issuerAddress: credential.xrplIssuerAddress,
      credentialTypeHex: credential.xrplCredentialType,
      signedTransactionBlob,
    });
    const acceptedXrplTransactionId =
      await this.credentialRepository.createXrplTransaction({
        credentialId: credential.id,
        evidence,
      });
    await this.credentialRepository.updateCredentialAcceptedXrplTransaction({
      credentialId: credential.id,
      acceptedXrplTransactionId,
    });
    await this.credentialRepository.markCredentialAccepted({
      credentialId: credential.id,
    });
    return evidence;
  }

  async prepareDeleteTestnetCredential(
    userId: bigint,
    credentialId: string,
    submitterRole: XrplCredentialDeleteSubmitterRole,
  ): Promise<XrplCredentialTransactionPayloadResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    this.assertTestnetCredentialEvidenceAvailable(credential);
    const xrplCredentialAdapter = this.getXrplCredentialAdapterOrThrow();
    const transaction = xrplCredentialAdapter.buildCredentialDeleteTransaction({
      submitterAddress: this.resolveDeleteSubmitterAddress(
        credential,
        submitterRole,
      ),
      subjectAddress: credential.xrplSubjectAddress,
      issuerAddress: credential.xrplIssuerAddress,
      credentialTypeHex: credential.xrplCredentialType,
    });

    return new XrplCredentialTransactionPayloadResult(
      XrplCredentialTransactionKind.DELETE,
      xrplCredentialAdapter.getNetworkName(),
      transaction as unknown as Record<string, unknown>,
    );
  }

  async deleteTestnetCredential(
    userId: bigint,
    credentialId: string,
    submitterRole: XrplCredentialDeleteSubmitterRole,
    signedTransactionBlob: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const credential = await this.loadOwnedCredential(userId, credentialId);
    this.assertTestnetCredentialEvidenceAvailable(credential);
    const xrplCredentialAdapter = this.getXrplCredentialAdapterOrThrow();

    const evidence = await xrplCredentialAdapter.submitCredentialDelete({
      submitterAddress: this.resolveDeleteSubmitterAddress(
        credential,
        submitterRole,
      ),
      subjectAddress: credential.xrplSubjectAddress,
      issuerAddress: credential.xrplIssuerAddress,
      credentialTypeHex: credential.xrplCredentialType,
      signedTransactionBlob,
    });
    const revokedXrplTransactionId =
      await this.credentialRepository.createXrplTransaction({
        credentialId: credential.id,
        evidence,
      });
    await this.credentialRepository.updateCredentialRevokedXrplTransaction({
      credentialId: credential.id,
      revokedXrplTransactionId,
    });
    await this.credentialRepository.markCredentialRevoked({
      credentialId: credential.id,
      revokedAt: new Date(),
    });
    return evidence;
  }

  private resolveDeleteSubmitterAddress(
    credential: Credential,
    submitterRole: XrplCredentialDeleteSubmitterRole,
  ): string {
    return submitterRole === XrplCredentialDeleteSubmitterRole.SUBJECT
      ? (credential.xrplSubjectAddress as string)
      : (credential.xrplIssuerAddress as string);
  }

  private async publishTestnetCredentialEvidence(
    subjectAddress: string,
    credentialTypeSource: string,
    expiresAt: Date,
    uri: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const xrplCredentialAdapter = this.getXrplCredentialAdapterOrThrow();
    return xrplCredentialAdapter.submitCredentialCreate({
      issuerAddress: xrplCredentialAdapter.getIssuerAddress(),
      subjectAddress,
      credentialTypeHex: this.buildCredentialTypeHex(credentialTypeSource),
      expiration: xrplCredentialAdapter.toXrplExpiration(expiresAt),
      uri,
    });
  }

  private async resolveXrplUri(
    documentCode: string,
    currentStage: IssuePipelineStage,
  ): Promise<string> {
    const s3ObjectKey =
      await this.credentialDocumentStageLookupRepository.findS3ObjectKey(
        documentCode,
        currentStage,
      );
    if (s3ObjectKey === null) {
      throw new DomainError(
        ErrorCode.Credential.DOCUMENT_STAGE_S3_KEY_MISSING,
        { documentCode, currentStage },
      );
    }
    return s3ObjectKey;
  }

  private buildCredentialTypeHex(source: string): string {
    return Buffer.from(source, "utf8").toString("hex").toUpperCase();
  }

  private toFailureReason(error: unknown): string {
    if (error instanceof DomainError) {
      return error.errorCode.code;
    }
    if (error instanceof Error && error.message.length > 0) {
      return error.message;
    }
    return "UNKNOWN_CREDENTIAL_ISSUE_FAILURE";
  }

  private getXrplCredentialAdapterOrThrow(): XrplCredentialAdapter {
    if (this.xrplCredentialAdapter === undefined) {
      throw new DomainError(ErrorCode.Credential.XRPL_CONFIG_MISSING, {
        key: "WALLET_SEED",
      });
    }
    return this.xrplCredentialAdapter;
  }

  private assertTestnetCredentialEvidenceAvailable(
    credential: Credential,
  ): asserts credential is Credential & {
    xrplIssuerAddress: string;
    xrplSubjectAddress: string;
    xrplCredentialType: string;
  } {
    if (
      credential.xrplIssuerAddress === null ||
      credential.xrplSubjectAddress === null ||
      credential.xrplCredentialType === null
    ) {
      throw new DomainError(ErrorCode.Credential.XRPL_EVIDENCE_REQUIRED, {
        credentialId: credential.credentialCode,
      });
    }
  }

  private async loadOwnedIssueRequest(
    userId: bigint,
    issueRequestCode: string,
  ): Promise<CredentialIssueRequest> {
    const request =
      await this.credentialRepository.findIssueRequestByCode(issueRequestCode);
    if (request === null) {
      throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND, {
        issueRequestId: issueRequestCode,
      });
    }
    if (request.userId !== userId) {
      throw new DomainError(ErrorCode.Credential.NOT_OWNED, {
        issueRequestId: issueRequestCode,
      });
    }
    return request;
  }

  private async loadOwnedCredential(
    userId: bigint,
    credentialCode: string,
  ): Promise<Credential> {
    const credential =
      await this.credentialRepository.findCredentialByCode(credentialCode);
    if (credential === null) {
      throw new DomainError(ErrorCode.Credential.NOT_FOUND, {
        credentialId: credentialCode,
      });
    }
    if (credential.userId !== userId) {
      throw new DomainError(ErrorCode.Credential.NOT_OWNED, {
        credentialId: credentialCode,
      });
    }
    return credential;
  }

  private assertSubmittable(credential: Credential): void {
    if (
      credential.status === CredentialStatus.EXPIRED ||
      credential.expiresAt.getTime() <= Date.now()
    ) {
      throw new DomainError(ErrorCode.Credential.EXPIRED, {
        credentialId: credential.credentialCode,
      });
    }
    if (credential.status === CredentialStatus.REVOKED) {
      throw new DomainError(ErrorCode.Credential.REVOKED, {
        credentialId: credential.credentialCode,
      });
    }
    if (credential.status !== CredentialStatus.ACCEPTED) {
      throw new DomainError(ErrorCode.Credential.NOT_SUBMITTABLE, {
        credentialId: credential.credentialCode,
      });
    }
  }

  private toIssueRequestCreateResult(
    request: CredentialIssueRequest,
    credentialId: string | null = null,
  ): CreateCredentialIssueRequestResult {
    return new CreateCredentialIssueRequestResult(
      request.issueRequestCode,
      request.status,
      this.buildPipeline(request.currentStage, request.status, request.isSuspended),
      request.currentStage,
      request.isSuspended,
      credentialId,
    );
  }

  private buildPipeline(
    currentStage: IssuePipelineStage,
    requestStatus: CredentialIssueRequestStatus,
    isSuspended: boolean = false,
  ): IssuePipelineStageItemResult[] {
    const currentIndex = issuePipelineStages.indexOf(currentStage);
    return issuePipelineStages.map((stage, index) => {
      let status =
        requestStatus === CredentialIssueRequestStatus.FAILED &&
        stage === currentStage
          ? IssuePipelineStageStatus.FAILED
          : index < currentIndex ||
              requestStatus === CredentialIssueRequestStatus.ISSUED
            ? IssuePipelineStageStatus.DONE
            : index === currentIndex
              ? IssuePipelineStageStatus.ACTIVE
              : IssuePipelineStageStatus.PENDING;

      // 일시 중지 상태이면 ACTIVE 단계를 SUSPENDED로 표시
      if (isSuspended && status === IssuePipelineStageStatus.ACTIVE) {
        status = IssuePipelineStageStatus.SUSPENDED;
      }

      return new IssuePipelineStageItemResult(
        stage,
        issuePipelineStageLabels[stage],
        status,
      );
    });
  }

  private toCredentialSummaryResult(
    credential: Credential,
  ): CredentialSummaryResult {
    return new CredentialSummaryResult(
      credential.credentialCode,
      credential.issueRequestCode,
      credential.documentCode,
      credential.documentTypeCode,
      credential.documentTypeName,
      credential.issuerCode,
      credential.status,
      credential.issuedAt,
      credential.expiresAt,
      credential.walletAddress,
      credential.currentStage,
      credential.xrplNetwork,
      credential.xrplTxHash,
      credential.xrplLedgerIndex,
      credential.xrplEngineResult,
      credential.xrplValidated,
      credential.xrplCredentialType,
    );
  }

  private toSubmissionItemResult(
    submission: CredentialSubmission,
  ): CredentialSubmissionItemResult {
    return new CredentialSubmissionItemResult(
      submission.submissionCode,
      submission.credentialCode,
      submission.recipientInstitutionId,
      submission.recipientInstitutionName,
      submission.status,
      submission.rejectionReason,
      submission.submittedAt,
    );
  }
}

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};
