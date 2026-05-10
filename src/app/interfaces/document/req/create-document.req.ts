import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

/**
 * 문서 발급 신청 요청 Body.
 *
 * 와이어프레임 A-01 의 doc-card 그리드에서 사용자가 선택한 카탈로그 코드 한 개를 전달.
 * (여러 건 동시 신청은 후속 spec — 현재는 1건씩.)
 */
export class CreateDocumentReq {
  @ApiProperty({
    description:
      "문서 카탈로그 코드 (DocumentType.code). 시드 예: KR-NTS-TAX-PAYMENT",
    example: "KR-NTS-TAX-PAYMENT",
    maxLength: 40,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly documentTypeCode!: string;
}
