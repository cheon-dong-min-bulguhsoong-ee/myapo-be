import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { DisputeType } from "../../../domain/dispute/enum/dispute-type.enum";

export class CreateDisputeReq {
  @ApiProperty({ enum: DisputeType })
  @IsEnum(DisputeType)
  readonly type!: DisputeType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly requestId!: string;
}
