import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { DisputeStatus } from "../../../domain/dispute/enum/dispute-status.enum";

export class ChangeDisputeStatusReq {
  @ApiProperty({ enum: DisputeStatus })
  @IsEnum(DisputeStatus)
  readonly newStatus!: DisputeStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readonly note?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  readonly isInternal?: boolean;

  @ApiProperty({ required: false, description: "RESOLVED 시 필수" })
  @IsString()
  @IsOptional()
  readonly credentialCode?: string;
}
