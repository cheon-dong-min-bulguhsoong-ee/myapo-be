import { ApiProperty } from "@nestjs/swagger";
import {
  CredentialIssuePipelineStageResult,
  ListCredentialsByIssuePipelineStageResult,
} from "../../../domain/credential/dto/credential.result";
import { CredentialIssuePipelineState } from "../../../domain/credential/enum/credential-issue-pipeline-state.enum";
import { CredentialSummaryRes } from "./credential.res";

export class CredentialIssuePipelineStageRes extends CredentialSummaryRes {
  @ApiProperty({ enum: CredentialIssuePipelineState })
  readonly credentialState!: CredentialIssuePipelineState;

  static from(
    result: CredentialIssuePipelineStageResult,
  ): CredentialIssuePipelineStageRes {
    return {
      ...CredentialSummaryRes.from(result),
      credentialState: result.credentialState,
    };
  }
}

export class ListCredentialsByIssuePipelineStageRes {
  @ApiProperty({ type: [CredentialIssuePipelineStageRes] })
  readonly credentials!: CredentialIssuePipelineStageRes[];

  static from(
    result: ListCredentialsByIssuePipelineStageResult,
  ): ListCredentialsByIssuePipelineStageRes {
    return {
      credentials: result.credentials.map(
        CredentialIssuePipelineStageRes.from,
      ),
    };
  }
}
