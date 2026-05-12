import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IssuePipelineStage } from "../../../domain/credential/enum/issue-pipeline-stage.enum";
import { DisputeType } from "../../../domain/dispute/enum/dispute-type.enum";

export class CreateDisputeReq {
  @ApiProperty({ enum: DisputeType })
  @IsEnum(DisputeType)
  readonly type!: DisputeType;

  @ApiProperty({ enum: IssuePipelineStage })
  @IsEnum(IssuePipelineStage)
  readonly targetStage!: IssuePipelineStage;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly requestId!: string;
}
