import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

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
    description:
      "원천 Document UUID. credential_issue_requests.document_code는 documents.document_code를 참조할 때만 사용한다.",
    nullable: true,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  @MaxLength(36)
  readonly documentCode?: string;

}
