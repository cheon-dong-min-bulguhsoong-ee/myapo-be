import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { IssuePipelineStage } from "../../../domain/credential/enum/issue-pipeline-stage.enum";

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
      "원천 Document UUID. credential_issue_requests.document_code는 documents.document_code를 참조한다.",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsNotEmpty()
  @MaxLength(36)
  readonly documentCode!: string;

  @ApiProperty({
    enum: IssuePipelineStage,
    description: "Credential issue pipeline 현재 stage",
    example: IssuePipelineStage.APOSTILLE_ISSUED,
  })
  @IsEnum(IssuePipelineStage)
  readonly currentStage!: IssuePipelineStage;
}
