import { CredentialSubmissionStatus } from "../enum/credential-submission-status.enum";

export class CredentialSubmission {
  constructor(
    public readonly id: bigint,
    public readonly submissionCode: string,
    public readonly credentialId: bigint,
    public readonly credentialCode: string,
    public readonly userId: bigint,
    public readonly submissionRequestId: string,
    public readonly recipientInstitutionId: string,
    public readonly recipientInstitutionName: string,
    public readonly status: CredentialSubmissionStatus,
    public readonly rejectionReason: string | null,
    public readonly authEventId: string | null,
    public readonly submittedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
