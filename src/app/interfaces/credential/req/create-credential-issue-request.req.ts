import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCredentialIssueRequestReq {
  @ApiProperty({
    description: "Credential 발급 대상 문서 카탈로그 ID",
    example: "KR-NTS-TAX-PAYMENT",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly documentTypeId!: string;

  @ApiProperty({
    description: "원천 Document 참조 ID. 기존 Document 연동 시에만 사용한다.",
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  readonly documentId?: string;

  @ApiProperty({
    description:
      "Document stage 참조 ID. 문서 단계 기반 크레덴셜 추적이 필요할 때 사용한다.",
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  readonly documentStageId?: string;

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
