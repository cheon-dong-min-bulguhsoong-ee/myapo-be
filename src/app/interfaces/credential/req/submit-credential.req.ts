import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

export class SubmitCredentialReq {
  @ApiProperty({ description: "기관 제출 요청 ID", example: "SUB-REQ-001" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  readonly submissionRequestId!: string;

  @ApiProperty({
    description: "기관 제출에 대한 사용자 동의 여부",
    example: true,
  })
  @IsBoolean()
  readonly consentConfirmed!: boolean;
}
