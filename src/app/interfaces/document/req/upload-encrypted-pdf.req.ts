import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { DocumentStage } from "../../../domain/document/enum/document-stage.enum";

/**
 * PDF 패스워드 보호 업로드 요청.
 *
 * `multipart/form-data` 의 file 필드(`file`) 옆에 `documentCode` + `stage` + `userPassword` 텍스트 필드가 함께 전송된다.
 * owner password 는 내부적으로 user password 와 동일하게 설정 — 외부 노출 없음.
 * userPk 는 JWT 에서 추출되므로 클라이언트가 보낼 필요 없고, 서버가 documentCode 의 소유자도 검증한다.
 */
export class UploadEncryptedPdfReq {
  @ApiProperty({
    description: "대상 Document 의 외부 노출 코드 (UUID).",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly documentCode!: string;

  @ApiProperty({
    enum: DocumentStage,
    description:
      "이 파일이 속하는 5단계 파이프라인의 stage. `document_stages.s3_object_key` 룩업 키.",
    example: DocumentStage.DOCUMENT_ARRIVED,
  })
  @IsEnum(DocumentStage)
  readonly stage!: DocumentStage;

  @ApiProperty({
    description:
      "PDF 열람 비밀번호. 다운받은 사람이 PDF 뷰어에서 이 값으로 연다.",
    example: "A1b2!c3d4",
    minLength: 4,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  readonly userPassword!: string;
}
