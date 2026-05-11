import { CredentialIssueRequestStatus } from "../enum/credential-issue-request-status.enum";
import { CredentialIssuePipelineState } from "../enum/credential-issue-pipeline-state.enum";
import { CredentialStatus } from "../enum/credential-status.enum";
import { CredentialSubmissionStatus } from "../enum/credential-submission-status.enum";
import { IssuePipelineStage } from "../enum/issue-pipeline-stage.enum";
import { IssuePipelineStageStatus } from "../enum/issue-pipeline-stage-status.enum";

export class IssuePipelineStageItemResult {
  constructor(
    public readonly stage: IssuePipelineStage,
    public readonly label: string,
    public readonly status: IssuePipelineStageStatus,
  ) {}
}

export class CreateCredentialIssueRequestResult {
  constructor(
    public readonly issueRequestId: string,
    public readonly status: CredentialIssueRequestStatus,
    public readonly pipeline: IssuePipelineStageItemResult[],
    public readonly currentStage: IssuePipelineStage,
  ) {}
}

export class CredentialIssueRequestResult extends CreateCredentialIssueRequestResult {
  constructor(
    issueRequestId: string,
    status: CredentialIssueRequestStatus,
    pipeline: IssuePipelineStageItemResult[],
    currentStage: IssuePipelineStage,
    public readonly credentialId: string | null,
    public readonly submissionCount: number,
  ) {
    super(issueRequestId, status, pipeline, currentStage);
  }
}

export class CredentialSummaryResult {
  constructor(
    public readonly credentialId: string,
    public readonly issueRequestId: string,
    public readonly documentTypeId: string,
    public readonly documentTypeName: string,
    public readonly issuerId: string,
    public readonly status: CredentialStatus,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly walletAddress: string,
    public readonly currentStage: string,
    public readonly xrplNetwork: string | null,
    public readonly xrplTxHash: string | null,
    public readonly xrplLedgerIndex: bigint | null,
    public readonly xrplEngineResult: string | null,
    public readonly xrplValidated: boolean | null,
    public readonly xrplCredentialType: string | null,
  ) {}
}

export class CredentialSubmissionItemResult {
  constructor(
    public readonly submissionId: string,
    public readonly credentialId: string,
    public readonly recipientInstitutionId: string,
    public readonly recipientInstitutionName: string,
    public readonly status: CredentialSubmissionStatus,
    public readonly rejectionReason: string | null,
    public readonly submittedAt: Date,
  ) {}
}

export class CredentialDetailResult extends CredentialSummaryResult {
  constructor(
    summary: CredentialSummaryResult,
    public readonly pipeline: IssuePipelineStageItemResult[],
    public readonly submissions: CredentialSubmissionItemResult[],
  ) {
    super(
      summary.credentialId,
      summary.issueRequestId,
      summary.documentTypeId,
      summary.documentTypeName,
      summary.issuerId,
      summary.status,
      summary.issuedAt,
      summary.expiresAt,
      summary.walletAddress,
      summary.currentStage,
      summary.xrplNetwork,
      summary.xrplTxHash,
      summary.xrplLedgerIndex,
      summary.xrplEngineResult,
      summary.xrplValidated,
      summary.xrplCredentialType,
    );
  }
}

export class ListCredentialsResult {
  constructor(public readonly credentials: CredentialSummaryResult[]) {}
}

export class CredentialIssuePipelineStageResult extends CredentialSummaryResult {
  constructor(
    summary: CredentialSummaryResult,
    public readonly credentialState: CredentialIssuePipelineState,
  ) {
    super(
      summary.credentialId,
      summary.issueRequestId,
      summary.documentTypeId,
      summary.documentTypeName,
      summary.issuerId,
      summary.status,
      summary.issuedAt,
      summary.expiresAt,
      summary.walletAddress,
      summary.currentStage,
      summary.xrplNetwork,
      summary.xrplTxHash,
      summary.xrplLedgerIndex,
      summary.xrplEngineResult,
      summary.xrplValidated,
      summary.xrplCredentialType,
    );
  }
}

export class ListCredentialsByIssuePipelineStageResult {
  constructor(
    public readonly credentials: CredentialIssuePipelineStageResult[],
  ) {}
}

export class SubmitCredentialResult {
  constructor(
    public readonly submissionId: string,
    public readonly credentialId: string,
    public readonly recipientInstitutionId: string,
    public readonly status: CredentialSubmissionStatus,
    public readonly submittedAt: Date,
  ) {}
}

export class ListCredentialSubmissionsResult {
  constructor(public readonly submissions: CredentialSubmissionItemResult[]) {}
}
