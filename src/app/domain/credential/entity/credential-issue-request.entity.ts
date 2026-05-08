import { CredentialIssueRequestStatus } from '../enum/credential-issue-request-status.enum';
import { IssuePipelineStage } from '../enum/issue-pipeline-stage.enum';

export class CredentialIssueRequest {
  constructor(
    public readonly id: bigint,
    public readonly issueRequestCode: string,
    public readonly userId: bigint,
    public readonly documentTypeCode: string,
    public readonly documentId: string | null,
    public readonly status: CredentialIssueRequestStatus,
    public readonly currentStage: IssuePipelineStage,
    public readonly currentSubstep: string | null,
    public readonly authEventId: string | null,
    public readonly requestedAt: Date,
    public readonly issuedAt: Date | null,
    public readonly failedAt: Date | null,
    public readonly failureReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
