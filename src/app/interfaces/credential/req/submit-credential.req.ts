import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
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

  @ApiProperty({
    description: "Auth 소유 인증 이벤트 ID. Credential은 참조만 저장한다.",
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  readonly authEventId?: string;
}
