import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateDocumentMvpReq {
  @ApiProperty({
    description: "발급할 문서 카탈로그 코드 (DocumentType.code).",
    example: "KR-NTS-TAX-PAYMENT",
    maxLength: 40,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly documentTypeCode!: string;
}
