import { ApiProperty } from '@nestjs/swagger';
import { CreateCredentialIssueRequestResult, CredentialIssueRequestResult } from '../../../domain/credential/dto/credential.result';
import { CredentialIssueRequestStatus } from '../../../domain/credential/enum/credential-issue-request-status.enum';
import { IssuePipelineStage } from '../../../domain/credential/enum/issue-pipeline-stage.enum';
import { IssuePipelineStageItemRes } from './credential-common.res';

export class CreateCredentialIssueRequestRes {
  @ApiProperty()
  readonly issueRequestId!: string;

  @ApiProperty({ enum: CredentialIssueRequestStatus })
  readonly status!: CredentialIssueRequestStatus;

  @ApiProperty({ type: [IssuePipelineStageItemRes] })
  readonly pipeline!: IssuePipelineStageItemRes[];

  @ApiProperty({ enum: IssuePipelineStage })
  readonly currentStage!: IssuePipelineStage;

  @ApiProperty({ nullable: true })
  readonly currentSubstep!: string | null;

  @ApiProperty({ nullable: true })
  readonly authEventId!: string | null;

  static from(result: CreateCredentialIssueRequestResult): CreateCredentialIssueRequestRes {
    return {
      issueRequestId: result.issueRequestId,
      status: result.status,
      pipeline: result.pipeline.map(IssuePipelineStageItemRes.from),
      currentStage: result.currentStage,
      currentSubstep: result.currentSubstep,
      authEventId: result.authEventId,
    };
  }
}

export class CredentialIssueRequestRes extends CreateCredentialIssueRequestRes {
  @ApiProperty({ nullable: true })
  readonly credentialId!: string | null;

  @ApiProperty()
  readonly submissionCount!: number;

  static from(result: CredentialIssueRequestResult): CredentialIssueRequestRes {
    return {
      ...CreateCredentialIssueRequestRes.from(result),
      credentialId: result.credentialId,
      submissionCount: result.submissionCount,
    };
  }
}
