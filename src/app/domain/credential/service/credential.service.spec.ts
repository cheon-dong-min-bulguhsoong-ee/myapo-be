import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import {
  BuildCredentialDeleteTransactionInput,
  SubmitCredentialAcceptInput,
  SubmitCredentialCreateInput,
  SubmitCredentialDeleteInput,
  XrplCredentialAdapter,
} from "../contract/xrpl-credential-adapter";
import {
  XrplCredentialTransactionEvidenceResult,
  XrplCredentialTransactionKind,
} from "../dto/xrpl-credential-evidence.result";
import { CredentialDocumentType } from "../entity/credential-document-type.entity";
import { Credential } from "../entity/credential.entity";
import { CredentialIssueRequest } from "../entity/credential-issue-request.entity";
import { CredentialSubmission } from "../entity/credential-submission.entity";
import { CredentialIssueRequestStatus } from "../enum/credential-issue-request-status.enum";
import { CredentialIssuePipelineState } from "../enum/credential-issue-pipeline-state.enum";
import { CredentialStatus } from "../enum/credential-status.enum";
import { CredentialSubmissionStatus } from "../enum/credential-submission-status.enum";
import { XrplCredentialDeleteSubmitterRole } from "../enum/xrpl-credential-delete-submitter-role.enum";
import { IssuePipelineStage } from "../enum/issue-pipeline-stage.enum";
import { CredentialDocumentStageLookupRepository } from "../repository/credential-document-stage-lookup.repository";
import { CredentialDocumentTypeRepository } from "../repository/credential-document-type.repository";
import {
  CreateCredentialInput,
  CreateCredentialIssueRequestInput,
  CreateCredentialSubmissionInput,
  CreateCredentialXrplTransactionInput,
  CredentialRepository,
  MarkCredentialIssueRequestFailedInput,
  MarkCredentialRevokedInput,
} from "../repository/credential.repository";
import { CredentialService } from "./credential.service";

class FakeDocumentTypeRepository extends CredentialDocumentTypeRepository {
  constructor(private readonly type: CredentialDocumentType | null) {
    super();
  }

  async findActiveByCode(
    _code: string,
  ): Promise<CredentialDocumentType | null> {
    return this.type;
  }
}

class FakeDocumentStageLookupRepository extends CredentialDocumentStageLookupRepository {
  constructor(private readonly s3ObjectKey: string | null = "documents/test.pdf") {
    super();
  }

  async findS3ObjectKey(
    _documentCode: string,
    _stage: IssuePipelineStage,
  ): Promise<string | null> {
    return this.s3ObjectKey;
  }
}

class FakeXrplCredentialAdapter extends XrplCredentialAdapter {
  lastAcceptInput: SubmitCredentialAcceptInput | null = null;
  lastDeleteInput: SubmitCredentialDeleteInput | null = null;
  lastCreateUri: string | null = null;

  getIssuerAddress(): string {
    return "rISSUER";
  }

  buildCredentialCreateTransaction(): never {
    throw new Error("not used");
  }

  buildCredentialAcceptTransaction(input: {
    subjectAddress: string;
    issuerAddress: string;
    credentialTypeHex: string;
  }) {
    return {
      TransactionType: "CredentialAccept" as const,
      Account: input.subjectAddress,
      Issuer: input.issuerAddress,
      CredentialType: input.credentialTypeHex.toUpperCase(),
    };
  }

  buildCredentialDeleteTransaction(input: {
    submitterAddress: string;
    subjectAddress: string | null;
    issuerAddress: string | null;
    credentialTypeHex: string;
  }) {
    return {
      TransactionType: "CredentialDelete" as const,
      Account: input.submitterAddress,
      ...(input.subjectAddress === null
        ? {}
        : { Subject: input.subjectAddress }),
      ...(input.issuerAddress === null ? {} : { Issuer: input.issuerAddress }),
      CredentialType: input.credentialTypeHex.toUpperCase(),
    };
  }

  async submitCredentialCreate(
    input: SubmitCredentialCreateInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    this.lastCreateUri = input.uri;
    return new XrplCredentialTransactionEvidenceResult(
      XrplCredentialTransactionKind.CREATE,
      "wss://s.altnet.rippletest.net:51233",
      "A".repeat(64),
      "tesSUCCESS",
      BigInt(123),
      true,
      "12",
      "rISSUER",
      "rISSUER",
      "rSUBJECT",
      "AA",
      0,
      { LedgerEntryType: "Credential" },
    );
  }

  async submitCredentialAccept(
    input: SubmitCredentialAcceptInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    this.lastAcceptInput = input;
    return new XrplCredentialTransactionEvidenceResult(
      XrplCredentialTransactionKind.ACCEPT,
      "wss://s.altnet.rippletest.net:51233",
      "B".repeat(64),
      "tesSUCCESS",
      BigInt(124),
      true,
      "12",
      "rSUBJECT",
      "rISSUER",
      "rSUBJECT",
      "AA",
      65536,
      { LedgerEntryType: "Credential", Flags: 65536 },
    );
  }

  async submitCredentialDelete(
    input: SubmitCredentialDeleteInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    this.lastDeleteInput = input;
    return new XrplCredentialTransactionEvidenceResult(
      XrplCredentialTransactionKind.DELETE,
      "wss://s.altnet.rippletest.net:51233",
      "C".repeat(64),
      "tesSUCCESS",
      BigInt(125),
      true,
      "12",
      input.submitterAddress,
      input.issuerAddress,
      input.subjectAddress,
      input.credentialTypeHex,
      null,
      null,
    );
  }

  async submitCredentialDeleteByIssuer(
    input: BuildCredentialDeleteTransactionInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    return new XrplCredentialTransactionEvidenceResult(
      XrplCredentialTransactionKind.DELETE,
      "wss://s.altnet.rippletest.net:51233",
      "D".repeat(64),
      "tesSUCCESS",
      BigInt(126),
      true,
      "12",
      input.submitterAddress,
      input.issuerAddress,
      input.subjectAddress,
      input.credentialTypeHex,
      null,
      null,
    );
  }

  async getCredentialObjects(): Promise<[]> {
    return [];
  }

  getNetworkName(): string {
    return "wss://s.altnet.rippletest.net:51233";
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

  async createIssueRequest(
    input: CreateCredentialIssueRequestInput,
  ): Promise<CredentialIssueRequest> {
    const request = new CredentialIssueRequest(
      BigInt(this.issueRequests.length + 1),
      input.issueRequestCode,
      input.userId,
      input.documentTypeCode,
      input.documentCode,
      input.status,
      input.currentStage,
      false,
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

  async markIssueRequestFailed(
    input: MarkCredentialIssueRequestFailedInput,
  ): Promise<CredentialIssueRequest> {
    const requestIndex = this.issueRequests.findIndex(
      (request) => request.id === input.issueRequestId,
    );
    const request = this.issueRequests[requestIndex];
    if (request === undefined) {
      throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND);
    }
    const failedRequest = new CredentialIssueRequest(
      request.id,
      request.issueRequestCode,
      request.userId,
      request.documentTypeCode,
      request.documentCode,
      CredentialIssueRequestStatus.FAILED,
      request.currentStage,
      request.isSuspended,
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

  async updateIssueRequestSuspension(
    issueRequestId: bigint,
    isSuspended: boolean,
  ): Promise<void> {
    const requestIndex = this.issueRequests.findIndex(
      (request) => request.id === issueRequestId,
    );
    const request = this.issueRequests[requestIndex];
    if (request === undefined) {
      throw new DomainError(ErrorCode.Credential.ISSUE_REQUEST_NOT_FOUND);
    }
    this.issueRequests[requestIndex] = new CredentialIssueRequest(
      request.id,
      request.issueRequestCode,
      request.userId,
      request.documentTypeCode,
      request.documentCode,
      request.status,
      request.currentStage,
      isSuspended,
      request.requestedAt,
      request.issuedAt,
      request.failedAt,
      request.failureReason,
      request.createdAt,
      new Date(),
    );
  }

  async findIssueRequestByCode(
    issueRequestCode: string,
  ): Promise<CredentialIssueRequest | null> {
    return (
      this.issueRequests.find(
        (request) => request.issueRequestCode === issueRequestCode,
      ) ?? null
    );
  }

  async findCredentialByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<Credential | null> {
    return (
      this.credentials.find(
        (credential) => credential.issueRequestId === issueRequestId,
      ) ?? null
    );
  }

  async createCredential(input: CreateCredentialInput): Promise<Credential> {
    const issueRequest = this.issueRequests.find(
      (request) => request.id === input.issueRequestId,
    );
    const credential = new Credential(
      BigInt(this.credentials.length + 1),
      input.credentialCode,
      input.issueRequestId,
      issueRequest?.issueRequestCode ?? "UNKNOWN",
      input.userId,
      input.documentCode,
      input.documentTypeCode,
      input.documentTypeName,
      input.issuerCode,
      input.status,
      "",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      input.currentStage,
      input.issuedAt,
      input.expiresAt,
      null,
      input.issuedAt,
      input.issuedAt,
    );
    this.credentials.push(credential);
    return credential;
  }

  async markCredentialRevoked(
    input: MarkCredentialRevokedInput,
  ): Promise<Credential> {
    const credentialIndex = this.credentials.findIndex(
      (credential) => credential.id === input.credentialId,
    );
    const credential = this.credentials[credentialIndex];
    if (credential === undefined) {
      throw new DomainError(ErrorCode.Credential.NOT_FOUND);
    }
    const revokedCredential = new Credential(
      credential.id,
      credential.credentialCode,
      credential.issueRequestId,
      credential.issueRequestCode,
      credential.userId,
      credential.documentCode,
      credential.documentTypeCode,
      credential.documentTypeName,
      credential.issuerCode,
      CredentialStatus.REVOKED,
      credential.walletAddress,
      credential.xrplCredentialId,
      credential.xrplNetwork,
      credential.xrplIssuerAddress,
      credential.xrplSubjectAddress,
      credential.xrplCredentialType,
      credential.xrplTxHash,
      credential.xrplLedgerIndex,
      credential.xrplEngineResult,
      credential.xrplValidated,
      credential.currentStage,
      credential.issuedAt,
      credential.expiresAt,
      input.revokedAt,
      credential.createdAt,
      input.revokedAt,
    );
    this.credentials[credentialIndex] = revokedCredential;
    return revokedCredential;
  }

  async markCredentialAccepted(input: {
    credentialId: bigint;
  }): Promise<Credential> {
    const credentialIndex = this.credentials.findIndex(
      (credential) => credential.id === input.credentialId,
    );
    const credential = this.credentials[credentialIndex];
    if (credential === undefined) {
      throw new DomainError(ErrorCode.Credential.NOT_FOUND);
    }
    const acceptedCredential = new Credential(
      credential.id,
      credential.credentialCode,
      credential.issueRequestId,
      credential.issueRequestCode,
      credential.userId,
      credential.documentCode,
      credential.documentTypeCode,
      credential.documentTypeName,
      credential.issuerCode,
      CredentialStatus.ACCEPTED,
      credential.walletAddress,
      credential.xrplCredentialId,
      credential.xrplNetwork,
      credential.xrplIssuerAddress,
      credential.xrplSubjectAddress,
      credential.xrplCredentialType,
      credential.xrplTxHash,
      credential.xrplLedgerIndex,
      credential.xrplEngineResult,
      credential.xrplValidated,
      credential.currentStage,
      credential.issuedAt,
      credential.expiresAt,
      credential.revokedAt,
      credential.createdAt,
      credential.updatedAt,
    );
    this.credentials[credentialIndex] = acceptedCredential;
    return acceptedCredential;
  }

  async createXrplTransaction(
    input: CreateCredentialXrplTransactionInput,
  ): Promise<bigint> {
    this.xrplTransactions.push(input);
    const credentialIndex = this.credentials.findIndex(
      (credential) => credential.id === input.credentialId,
    );
    if (credentialIndex === -1) {
      return BigInt(this.xrplTransactions.length);
    }
    const credential = this.credentials[credentialIndex];
    const evidence = input.evidence;
    this.credentials[credentialIndex] = new Credential(
      credential.id,
      credential.credentialCode,
      credential.issueRequestId,
      credential.issueRequestCode,
      credential.userId,
      credential.documentCode,
      credential.documentTypeCode,
      credential.documentTypeName,
      credential.issuerCode,
      credential.status,
      evidence.subject ?? credential.walletAddress,
      evidence.issuer === null || evidence.subject === null
        ? credential.xrplCredentialId
        : `${evidence.issuer}:${evidence.subject}:${evidence.credentialType}`,
      evidence.network,
      evidence.issuer,
      evidence.subject,
      evidence.credentialType,
      evidence.transactionHash,
      evidence.ledgerIndex,
      evidence.engineResult,
      evidence.validated,
      credential.currentStage,
      credential.issuedAt,
      credential.expiresAt,
      credential.revokedAt,
      credential.createdAt,
      credential.updatedAt,
    );
    return BigInt(this.xrplTransactions.length);
  }

  async updateCredentialCreatedXrplTransaction(input: {
    credentialId: bigint;
    createdXrplTransactionId: bigint | null;
  }): Promise<void> {
    void input;
  }

  async updateCredentialAcceptedXrplTransaction(input: {
    credentialId: bigint;
    acceptedXrplTransactionId: bigint | null;
  }): Promise<void> {
    void input;
  }

  async updateCredentialRevokedXrplTransaction(input: {
    credentialId: bigint;
    revokedXrplTransactionId: bigint | null;
  }): Promise<void> {
    void input;
  }

  async findCredentialByCode(
    credentialCode: string,
  ): Promise<Credential | null> {
    return (
      this.credentials.find(
        (credential) => credential.credentialCode === credentialCode,
      ) ?? null
    );
  }

  async listCredentialsByUserId(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<Credential[]> {
    return this.credentials.filter(
      (credential) =>
        credential.userId === userId &&
        (status === undefined || credential.status === status),
    );
  }

  async listCredentialsByUserIdAndCurrentStage(
    userId: bigint,
    currentStage: IssuePipelineStage,
  ): Promise<Credential[]> {
    return this.credentials.filter(
      (credential) =>
        credential.userId === userId &&
        credential.currentStage === currentStage,
    );
  }

  async hasCredentialXrplTransaction(
    credentialId: bigint,
    transactionKind: XrplCredentialTransactionKind,
  ): Promise<boolean> {
    return this.xrplTransactions.some(
      (input) =>
        input.credentialId === credentialId &&
        input.evidence.transactionKind === transactionKind,
    );
  }

  async countSubmissionsByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<number> {
    const credential =
      await this.findCredentialByIssueRequestId(issueRequestId);
    return credential === null
      ? 0
      : this.submissions.filter(
          (submission) => submission.credentialId === credential.id,
        ).length;
  }

  async createSubmission(
    input: CreateCredentialSubmissionInput,
  ): Promise<CredentialSubmission> {
    if (
      this.submissions.some(
        (submission) =>
          submission.credentialId === input.credentialId &&
          submission.submissionRequestId === input.submissionRequestId,
      )
    ) {
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
      input.submittedAt,
      input.submittedAt,
      input.submittedAt,
    );
    this.submissions.push(submission);
    return submission;
  }

  async listSubmissionsByCredentialId(
    credentialId: bigint,
  ): Promise<CredentialSubmission[]> {
    return this.submissions.filter(
      (submission) => submission.credentialId === credentialId,
    );
  }

  async listSubmissionsByUserId(
    userId: bigint,
  ): Promise<CredentialSubmission[]> {
    return this.submissions.filter(
      (submission) => submission.userId === userId,
    );
  }

  async updateCredential(credential: Credential): Promise<void> {
    const index = this.credentials.findIndex((c) => c.id === credential.id);
    if (index !== -1) {
      this.credentials[index] = credential;
    }
  }
}

describe("CredentialService", () => {
  const documentType = new CredentialDocumentType(
    "KR-NTS-TAX-PAYMENT",
    "납세증명서",
    "KR-NTS",
    6,
  );

  it("creates an issued credential from a protected issue request", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );

    const result = await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );

    expect(result.status).toBe(CredentialIssueRequestStatus.ISSUED);
    expect(result.currentStage).toBe(IssuePipelineStage.APOSTILLE_DOC_ISSUED);
    expect(result.pipeline).toHaveLength(5);
    expect(repo.credentials).toHaveLength(1);
    expect(repo.credentials[0].status).toBe(CredentialStatus.CREATED);
    expect(repo.xrplTransactions).toHaveLength(1);
  });

  it("passes document_stages.s3_object_key as XRPL CredentialCreate URI source (adapter hex-encodes)", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository("documents/abc.pdf"),
      adapter,
    );

    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );

    expect(adapter.lastCreateUri).toBe("documents/abc.pdf");
  });

  it("throws DOCUMENT_STAGE_S3_KEY_MISSING when matching stage has no s3_object_key", async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(null),
      new FakeXrplCredentialAdapter(),
    );

    await expect(
      service.createIssueRequest(
        BigInt(1),
        documentType.code,
        "550e8400-e29b-41d4-a716-446655440000",
        IssuePipelineStage.APOSTILLE_DOC_ISSUED,
        "rUserWallet",
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.Credential.DOCUMENT_STAGE_S3_KEY_MISSING,
    });
    expect(repo.issueRequests).toHaveLength(0);
  });

  it("blocks submission without explicit consent", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );

    await expect(
      service.submitCredential(
        BigInt(1),
        repo.credentials[0].credentialCode,
        "SUB-REQ-1",
        false,
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.Credential.CONSENT_REQUIRED,
    });
  });

  it("creates one submission row per institution submission request", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );
    await service.acceptTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      "signed-accept",
    );

    const result = await service.submitCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      "SUB-REQ-1",
      true,
    );

    expect(result.status).toBe(CredentialSubmissionStatus.RECEIVED);
    expect(result.recipientInstitutionId).toBe("SUB-REQ-1");
    expect(repo.submissions).toHaveLength(1);
  });

  it("lists all credentials when status is omitted", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );

    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );

    (repo.credentials[1] as any).status = CredentialStatus.EXPIRED;

    const result = await service.listCredentials(BigInt(1));

    expect(result.credentials).toHaveLength(2);
    expect(result.credentials.map((credential) => credential.status)).toEqual(
      expect.arrayContaining([
        CredentialStatus.CREATED,
        CredentialStatus.EXPIRED,
      ]),
    );
  });

  it("lists credentials by issue pipeline stage with created and accepted states", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );

    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );
    await service.acceptTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      "signed-accept",
    );

    const result = await service.listCredentialsByIssuePipelineStage(
      BigInt(1),
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
    );

    expect(result.credentials).toHaveLength(2);
    expect(result.credentials.map((credential) => credential.credentialState))
      .toEqual(
        expect.arrayContaining([
          CredentialIssuePipelineState.ACCEPTED,
          CredentialIssuePipelineState.CREATED,
        ]),
      );
  });

  it("stores validated XRP Testnet evidence when adapter publishes CredentialCreate", async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      new FakeXrplCredentialAdapter(),
    );

    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rSUBJECT",
    );

    expect(repo.credentials[0].xrplTxHash).toBe("A".repeat(64));
    expect(repo.credentials[0].xrplLedgerIndex).toBe(BigInt(123));
    expect(repo.credentials[0].xrplValidated).toBe(true);
    expect(repo.xrplTransactions).toHaveLength(1);
  });

  it("marks the issue request failed when Testnet CredentialCreate fails", async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      new FailingXrplCredentialAdapter(),
    );

    await expect(
      service.createIssueRequest(
        BigInt(1),
        documentType.code,
        "550e8400-e29b-41d4-a716-446655440000",
        IssuePipelineStage.APOSTILLE_DOC_ISSUED,
        "rSUBJECT",
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.Credential.XRPL_TESTNET_PUBLISH_FAILED,
    });

    expect(repo.issueRequests).toHaveLength(1);
    expect(repo.issueRequests[0].status).toBe(
      CredentialIssueRequestStatus.FAILED,
    );
    expect(repo.issueRequests[0].failedAt).not.toBeNull();
    expect(repo.issueRequests[0].failureReason).toBe(
      ErrorCode.Credential.XRPL_TESTNET_PUBLISH_FAILED.code,
    );
    expect(repo.credentials).toHaveLength(0);
    expect(repo.xrplTransactions).toHaveLength(0);
  });

  it("blocks credential creation when Testnet adapter is not configured", async () => {
    const repo = new FakeCredentialRepository();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
    );

    await expect(
      service.createIssueRequest(
        BigInt(1),
        documentType.code,
        "550e8400-e29b-41d4-a716-446655440000",
        IssuePipelineStage.APOSTILLE_DOC_ISSUED,
        "rSUBJECT",
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.Credential.XRPL_CONFIG_MISSING,
    });

    expect(repo.issueRequests).toHaveLength(1);
    expect(repo.issueRequests[0].status).toBe(
      CredentialIssueRequestStatus.FAILED,
    );
    expect(repo.credentials).toHaveLength(0);
    expect(repo.xrplTransactions).toHaveLength(0);
  });

  it("stores XRP Testnet CredentialAccept evidence for a Testnet credential", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rSUBJECT",
    );

    const prepared = await service.prepareAcceptTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
    );
    const evidence = await service.acceptTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      "signed-accept",
    );

    expect(prepared.transaction).toMatchObject({
      TransactionType: "CredentialAccept",
      Account: "rSUBJECT",
      Issuer: "rISSUER",
      CredentialType: "AA",
    });
    expect(evidence.transactionKind).toBe(XrplCredentialTransactionKind.ACCEPT);
    expect(evidence.transactionHash).toBe("B".repeat(64));
    expect(repo.xrplTransactions).toHaveLength(2);
    expect(repo.xrplTransactions[1].evidence.transactionKind).toBe(
      XrplCredentialTransactionKind.ACCEPT,
    );
    expect(adapter.lastAcceptInput?.signedTransactionBlob).toBe(
      "signed-accept",
    );
  });

  it("stores XRP Testnet CredentialDelete evidence with subject submitter and revokes the credential", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rSUBJECT",
    );

    const evidence = await service.deleteTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      XrplCredentialDeleteSubmitterRole.SUBJECT,
      "signed-delete-subject",
    );

    const prepared = await service.prepareDeleteTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      XrplCredentialDeleteSubmitterRole.SUBJECT,
    );

    expect(prepared.transaction).toMatchObject({
      Account: "rSUBJECT",
      Subject: "rSUBJECT",
      Issuer: "rISSUER",
    });
    expect(adapter.lastDeleteInput?.submitterAddress).toBe("rSUBJECT");
    expect(adapter.lastDeleteInput?.signedTransactionBlob).toBe(
      "signed-delete-subject",
    );
    expect(evidence.transactionKind).toBe(XrplCredentialTransactionKind.DELETE);
    expect(evidence.account).toBe("rSUBJECT");
    expect(evidence.transactionHash).toBe("C".repeat(64));
    expect(repo.xrplTransactions).toHaveLength(2);
    expect(repo.xrplTransactions[1].evidence.transactionKind).toBe(
      XrplCredentialTransactionKind.DELETE,
    );
    expect(repo.credentials[0].status).toBe(CredentialStatus.REVOKED);
    expect(repo.credentials[0].revokedAt).not.toBeNull();
  });

  it("stores XRP Testnet CredentialDelete evidence with issuer submitter", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rSUBJECT",
    );

    const evidence = await service.deleteTestnetCredential(
      BigInt(1),
      repo.credentials[0].credentialCode,
      XrplCredentialDeleteSubmitterRole.ISSUER,
      "signed-delete-issuer",
    );

    expect(adapter.lastDeleteInput?.submitterAddress).toBe("rISSUER");
    expect(adapter.lastDeleteInput?.signedTransactionBlob).toBe(
      "signed-delete-issuer",
    );
    expect(evidence.transactionKind).toBe(XrplCredentialTransactionKind.DELETE);
    expect(evidence.account).toBe("rISSUER");
    expect(repo.xrplTransactions[1].evidence.transactionKind).toBe(
      XrplCredentialTransactionKind.DELETE,
    );
  });

  it("blocks Testnet accept when XRPL evidence is missing", async () => {
    const repo = new FakeCredentialRepository();
    const adapter = new FakeXrplCredentialAdapter();
    const service = new CredentialService(
      repo,
      new FakeDocumentTypeRepository(documentType),
      new FakeDocumentStageLookupRepository(),
      adapter,
    );
    await service.createIssueRequest(
      BigInt(1),
      documentType.code,
      "550e8400-e29b-41d4-a716-446655440000",
      IssuePipelineStage.APOSTILLE_DOC_ISSUED,
      "rUserWallet",
    );

    (repo.credentials[0] as any).xrplIssuerAddress = null;
    (repo.credentials[0] as any).xrplSubjectAddress = null;
    (repo.credentials[0] as any).xrplCredentialType = null;

    await expect(
      service.acceptTestnetCredential(
        BigInt(1),
        repo.credentials[0].credentialCode,
        "signed-accept",
      ),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.Credential.XRPL_EVIDENCE_REQUIRED,
    });
  });
});
