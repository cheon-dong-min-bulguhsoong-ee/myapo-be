import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

/**
 * 문서 단계 승인 + 전이 요청 Body.
 *
 * documentCode 는 path 파라미터로 받으므로 body 에는 두지 않는다.
 * 어느 stage 로 전이할지는 서버가 documents.current_stage 로 판단 — 클라가 stage 를 보내지 않는다.
 *
 * `xrplTxHash` = 사용자가 자기 seed 로 서명한 XRPL TX 해시 (단계 통과 증거).
 * 기존엔 `POST /documents/approvals` 에서 따로 기록하던 값이, 본 API 로 통합되었다.
 */
export class AdvanceDocumentStageReq {
  @ApiProperty({
    description:
      "사용자가 서명한 XRPL 트랜잭션 해시 · 64자 hex (대문자). document_approvals.xrpl_tx_hash 컬럼과 동일 형식.",
    example: "A5111111111111111111111111111111111111111111111111111111111111AA",
  })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64)
  @Matches(/^[0-9A-F]{64}$/, {
    message: "xrplTxHash 는 64자의 대문자 hex 여야 합니다.",
  })
  readonly xrplTxHash!: string;
}
