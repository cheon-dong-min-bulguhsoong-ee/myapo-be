import { ApiProperty } from '@nestjs/swagger';
import { CredentialSubmissionItemResult, ListCredentialSubmissionsResult, SubmitCredentialResult } from '../../../domain/credential/dto/credential.result';
import { CredentialSubmissionStatus } from '../../../domain/credential/enum/credential-submission-status.enum';

export class CredentialSubmissionItemRes {
  @ApiProperty()
  readonly submissionId!: string;

  @ApiProperty()
  readonly credentialId!: string;

  @ApiProperty()
  readonly recipientInstitutionId!: string;

  @ApiProperty()
  readonly recipientInstitutionName!: string;

  @ApiProperty({ enum: CredentialSubmissionStatus })
  readonly status!: CredentialSubmissionStatus;

  @ApiProperty({ nullable: true })
  readonly rejectionReason!: string | null;

  @ApiProperty()
  readonly submittedAt!: string;

  @ApiProperty({ nullable: true })
  readonly authEventId!: string | null;

  static from(result: CredentialSubmissionItemResult): CredentialSubmissionItemRes {
    return {
      submissionId: result.submissionId,
      credentialId: result.credentialId,
      recipientInstitutionId: result.recipientInstitutionId,
      recipientInstitutionName: result.recipientInstitutionName,
      status: result.status,
      rejectionReason: result.rejectionReason,
      submittedAt: result.submittedAt.toISOString(),
      authEventId: result.authEventId,
    };
  }
}

export class SubmitCredentialRes {
  @ApiProperty()
  readonly submissionId!: string;

  @ApiProperty()
  readonly credentialId!: string;

  @ApiProperty()
  readonly recipientInstitutionId!: string;

  @ApiProperty({ enum: CredentialSubmissionStatus })
  readonly status!: CredentialSubmissionStatus;

  @ApiProperty()
  readonly submittedAt!: string;

  @ApiProperty({ nullable: true })
  readonly authEventId!: string | null;

  static from(result: SubmitCredentialResult): SubmitCredentialRes {
    return {
      submissionId: result.submissionId,
      credentialId: result.credentialId,
      recipientInstitutionId: result.recipientInstitutionId,
      status: result.status,
      submittedAt: result.submittedAt.toISOString(),
      authEventId: result.authEventId,
    };
  }
}

export class ListCredentialSubmissionsRes {
  @ApiProperty({ type: [CredentialSubmissionItemRes] })
  readonly submissions!: CredentialSubmissionItemRes[];

  static from(result: ListCredentialSubmissionsResult): ListCredentialSubmissionsRes {
    return { submissions: result.submissions.map(CredentialSubmissionItemRes.from) };
  }
}
