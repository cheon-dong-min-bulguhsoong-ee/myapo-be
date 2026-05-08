import { DomainError } from '../../common/error/domain.error';
import { ErrorCode } from '../../common/error/error-code';
import { XrplCredentialAdapter } from '../contract/xrpl-credential-adapter';
import { XrplCredentialTransactionEvidenceResult, XrplCredentialTransactionKind } from '../dto/xrpl-credential-evidence.result';
import { CredentialDocumentType } from '../entity/credential-document-type.entity';
import { Credential } from '../entity/credential.entity';
import { CredentialIssueRequest } from '../entity/credential-issue-request.entity';
import { CredentialSubmission } from '../entity/credential-submission.entity';
import { CredentialIssueRequestStatus } from '../enum/credential-issue-request-status.enum';
import { CredentialStatus } from '../enum/credential-status.enum';
import { CredentialSubmissionStatus } from '../enum/credential-submission-status.enum';
import { IssuePipelineStage } from '../enum/issue-pipeline-stage.enum';
import { CredentialDocumentTypeRepository } from '../repository/credential-document-type.repository';
import {
  CreateCredentialInput,
  CreateCredentialIssueRequestInput,
  CreateCredentialSubmissionInput,
  CreateCredentialXrplTransactionInput,
  CredentialRepository,
  MarkCredentialIssueRequestFailedInput,
} from '../repository/credential.repository';
import { CredentialService } from './credential.service';

class FakeDocumentTypeRepository extends CredentialDocumentTypeRepository {
  constructor(private readonly type: CredentialDocumentType | null) {
    super();
  }

  async findActiveByCode(_code: string): Promise<CredentialDocumentType | null> {
    return this.type;
  }
}


class FakeXrplCredentialAdapter extends XrplCredentialAdapter {
  getIssuerAddress(): string {
    return 'rISSUER';
  }

  buildCredentialCreateTransaction(): never {
    throw new Error('not used');
  }

  buildCredentialAcceptTransaction(): never {
    throw new Error('not used');
  }

  buildCredentialDeleteTransaction(): never {
    throw new Error('not used');
  }

  async submitCredentialCreate(): Promise<XrplCredentialTransactionEvidenceResult> {
    return new XrplCredentialTransactionEvidenceResult(
      XrplCredentialTransactionKind.CREATE,
      'wss://s.altnet.rippletest.net:51233',
      'A'.repeat(64),
      'tesSUCCESS',
      BigInt(123),
      true,
      '12',
      'rISSUER',
      'rISSUER',
      'rSUBJECT',
      'AA',
      0,
      { LedgerEntryType: 'Credential' },
    );
  }

  async submitCredentialAccept(): Promise<XrplCredentialTransactionEvidenceResult> {
    throw new Error('not used');
  }

  async submitCredentialDelete(): Promise<XrplCredentialTransactionEvidenceResult> {
    throw new Error('not used');
  }

  async getCredentialObjects(): Promise<[]> {
    return [];
  }

  encodeUriToHex(uri: string): string {
    return uri;
  }

  toXrplExpiration(): number {
    return 123;
  }
}

class FailingXrplCredentialAdapter extends FakeXrplCredentialAdapter {
  async submitCredentialCreate(): Promise<XrplCredentialTransactionEvidenceResult> {
    throw new DomainError(ErrorCode.Credential.XRPL_TESTNET_PUBLISH_FAILED);
  }
}

class FakeCredentialRepository extends CredentialRepository {
  issueRequests: CredentialIssueRequest[] = [];
  credentials: Credential[] = [];
  submissions: CredentialSubmission[] = [];
  xrplTransactions: CreateCredentialXrplTransactionInput[] = [];

  async createIssueRequest(input: CreateCredentialIssueRequestInput): Promise<CredentialIssueRequest> {
    const request = new CredentialIssueRequest(
      BigInt(this.issueRequests.length + 1),
      input.issueRequestCode,
      input.userId,
      input.documentTypeCode,
      input.documentId,
      input.status,
      input.currentStage,
      input.currentSubstep,
      input.authEventId,
      input.requestedAt,
      null,
      null,
      null,
      input.requestedAt,
      input.requestedAt,
    );
    this.issueRequests.push(request);
    return request;
  }

  async markIssueRequestFailed(input: MarkCredentialIssueRequestFailedInput): Promise<CredentialIssueRequest> {
    const requestIndex = this.issueRequests.findIndex((request) => request.id === input.issueRequestId);
    const request = this.issueRequests[requestIndex];
    if (request === undefined) {
      throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND);
    }
    const failedRequest = new CredentialIssueRequest(
      request.id,
      request.issueRequestCode,
      request.userId,
      request.documentTypeCode,
      request.documentId,
      CredentialIssueRequestStatus.FAILED,
      request.currentStage,
      request.currentSubstep,
      request.authEventId,
      request.requestedAt,
      request.issuedAt,
      input.failedAt,
      input.failureReason,
      request.createdAt,
      input.failedAt,
    );
    this.issueRequests[requestIndex] = failedRequest;
    return failedRequest;
  }

  async findIssueRequestByCode(issueRequestCode: string): Promise<CredentialIssueRequest | null> {
    return this.issueRequests.find((request) => request.issueRequestCode === issueRequestCode) ?? null;
  }

  async findCredentialByIssueRequestId(issueRequestId: bigint): Promise<Credential | null> {
    return this.credentials.find((credential) => credential.issueRequestId === issueRequestId) ?? null;
  }

  async createCredential(input: CreateCredentialInput): Promise<Credential> {
    const credential = new Credential(
      BigInt(this.credentials.length + 1),
      input.credentialCode,
      input.issueRequestId,
      input.issueRequestCode,
      input.userId,
      input.documentTypeCode,
      input.documentTypeName,
      input.issuerCode,
      input.status,
      input.walletAddress,
      input.isMock,
      input.xrplCredentialId,
      input.xrplNetwork,
      input.xrplIssuerAddress,
      input.xrplSubjectAddress,
      input.xrplCredentialType,
      input.xrplTxHash,
      input.xrplLedgerIndex,
      input.xrplEngineResult,
      input.xrplValidated,
      null,
      input.sourceDocumentRef,
      input.authEventId,
      input.issuedAt,
      input.expiresAt,
      null,
      null,
      input.issuedAt,
      input.issuedAt,
    );
    this.credentials.push(credential);
    return credential;
  }

  async createXrplTransaction(input: CreateCredentialXrplTransactionInput): Promise<void> {
    this.xrplTransactions.push(input);
  }

  async findCredentialByCode(credentialCode: string): Promise<Credential | null> {
    return this.credentials.find((credential) => credential.credentialCode === credentialCode) ?? null;
  }

  async listCredentialsByUserId(userId: bigint, status?: CredentialStatus): Promise<Credential[]> {
    return this.credentials.filter((credential) => credential.userId === userId && (status === undefined || credential.status === status));
  }

  async countSubmissionsByIssueRequestId(issueRequestId: bigint): Promise<number> {
    const credential = await this.findCredentialByIssueRequestId(issueRequestId);
    return credential === null ? 0 : this.submissions.filter((submission) => submission.credentialId === credential.id).length;
  }

  async createSubmission(input: CreateCredentialSubmissionInput): Promise<CredentialSubmission> {
    if (this.submissions.some((submission) => submission.credentialId === input.credentialId && submission.submissionRequestId === input.submissionRequestId)) {
      throw new DomainError(ErrorCode.Credential.SUBMISSION_DUPLICATED);
    }
    const submission = new CredentialSubmission(
      BigInt(this.submissions.length + 1),
      input.submissionCode,
      input.credentialId,
      input.credentialCode,
      input.userId,
      input.submissionRequestId,
      input.recipientInstitutionId,
      input.recipientInstitutionName,
      input.status,
      null,
      input.authEventId,
      input.submittedAt,
      input.submittedAt,
      input.submittedAt,
    );
    this.submissions.push(submission);
    return submission;
  }

  async listSubmissionsByCredentialId(credentialId: bigint): Promise<CredentialSubmission[]> {
    return this.submissions.filter((submission) => submission.credentialId === credentialId);
  }

  async listSubmissionsByUserId(userId: bigint): Promise<CredentialSubmission[]> {
    return this.submissions.filter((submission) => submission.userId === userId);
  }
}

describe('CredentialService', () => {
  const documentType = new CredentialDocumentType('KR-NTS-TAX-PAYMENT', '납세증명서', 'KR-NTS', 6);

  it('creates an issued MVP mock credential from a protected issue request', async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(repo, new FakeDocumentTypeRepository(documentType));

    const result = await service.createIssueRequest(BigInt(1), documentType.code, null, 'auth-event-1', 'rUserWallet');

    expect(result.status).toBe(CredentialIssueRequestStatus.ISSUED);
    expect(result.currentStage).toBe(IssuePipelineStage.ISSUED);
    expect(result.pipeline).toHaveLength(5);
    expect(repo.credentials).toHaveLength(1);
    expect(repo.credentials[0].status).toBe(CredentialStatus.ISSUED);
    expect(repo.credentials[0].isMock).toBe(true);
    expect(repo.credentials[0].authEventId).toBe('auth-event-1');
  });

  it('blocks submission without explicit consent', async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(repo, new FakeDocumentTypeRepository(documentType));
    await service.createIssueRequest(BigInt(1), documentType.code, null, null, 'rUserWallet');

    await expect(
      service.submitCredential(BigInt(1), repo.credentials[0].credentialCode, 'SUB-REQ-1', false, null),
    ).rejects.toMatchObject({ errorCode: ErrorCode.Credential.CONSENT_REQUIRED });
  });

  it('creates one submission row per institution submission request', async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(repo, new FakeDocumentTypeRepository(documentType));
    await service.createIssueRequest(BigInt(1), documentType.code, null, null, 'rUserWallet');

    const result = await service.submitCredential(BigInt(1), repo.credentials[0].credentialCode, 'SUB-REQ-1', true, 'auth-event-2');

    expect(result.status).toBe(CredentialSubmissionStatus.RECEIVED);
    expect(result.recipientInstitutionId).toBe('SUB-REQ-1');
    expect(result.authEventId).toBe('auth-event-2');
    expect(repo.submissions).toHaveLength(1);
  });

  it('stores validated XRP Testnet evidence when adapter publishes CredentialCreate', async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeXrplCredentialAdapter(),
    );

    await service.createIssueRequest(BigInt(1), documentType.code, null, null, 'rSUBJECT');

    expect(repo.credentials[0].isMock).toBe(false);
    expect(repo.credentials[0].xrplTxHash).toBe('A'.repeat(64));
    expect(repo.credentials[0].xrplLedgerIndex).toBe(BigInt(123));
    expect(repo.credentials[0].xrplValidated).toBe(true);
    expect(repo.xrplTransactions).toHaveLength(1);
  });

  it('marks the issue request failed when Testnet CredentialCreate fails', async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FailingXrplCredentialAdapter(),
    );

    await expect(
      service.createIssueRequest(BigInt(1), documentType.code, null, null, 'rSUBJECT'),
    ).rejects.toMatchObject({ errorCode: ErrorCode.Credential.XRPL_TESTNET_PUBLISH_FAILED });

    expect(repo.issueRequests).toHaveLength(1);
    expect(repo.issueRequests[0].status).toBe(CredentialIssueRequestStatus.FAILED);
    expect(repo.issueRequests[0].failedAt).not.toBeNull();
    expect(repo.issueRequests[0].failureReason).toBe(ErrorCode.Credential.XRPL_TESTNET_PUBLISH_FAILED.code);
    expect(repo.credentials).toHaveLength(0);
    expect(repo.xrplTransactions).toHaveLength(0);
  });

});
