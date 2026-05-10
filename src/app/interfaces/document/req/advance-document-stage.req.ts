import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

/**
 * 문서 단계 전이 요청 Body.
 *
 * documentCode 한 개만 받는다 — 어느 stage 로 전이할지는
 * 서버가 documents.current_stage 와 누적된 DocumentApproval 로 판단.
 * (클라가 stage 를 보내면 동기화 어긋남 위험.)
 */
export class AdvanceDocumentStageReq {
  @ApiProperty({
    description:
      "발급 신청 시 서버가 발급한 문서 외부 코드 (UUID). documents.document_code 와 동일.",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly documentCode!: string;
}
