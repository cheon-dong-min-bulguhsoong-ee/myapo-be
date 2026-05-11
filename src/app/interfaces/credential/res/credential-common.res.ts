import { ApiProperty } from "@nestjs/swagger";
import { IssuePipelineStageItemResult } from "../../../domain/credential/dto/credential.result";
import { IssuePipelineStage } from "../../../domain/credential/enum/issue-pipeline-stage.enum";
import { IssuePipelineStageStatus } from "../../../domain/credential/enum/issue-pipeline-stage-status.enum";

export class IssuePipelineStageItemRes {
  @ApiProperty({ enum: IssuePipelineStage })
  readonly stage!: IssuePipelineStage;

  @ApiProperty()
  readonly label!: string;

  @ApiProperty({ enum: IssuePipelineStageStatus })
  readonly status!: IssuePipelineStageStatus;

  static from(result: IssuePipelineStageItemResult): IssuePipelineStageItemRes {
    return {
      stage: result.stage,
      label: result.label,
      status: result.status,
    };
  }
}
