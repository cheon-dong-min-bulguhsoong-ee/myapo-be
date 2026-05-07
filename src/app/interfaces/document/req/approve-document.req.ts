import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

/**
 * 문서 단계 승인 요청 Body.
 *
 * 사용자가 자기 seed 로 서명한 XRPL TX 의 해시 + 대상 문서 코드를 전달.
 * (어느 단계 승인인지는 documents.current_stage 로 서버가 결정 — 클라이언트가 stage 를 보내지 않는다.)
 */
export class ApproveDocumentReq {
  @ApiProperty({
    description:
      '발급 신청 시 서버가 발급한 문서 외부 코드 (UUID). documents.document_code 와 동일.',
    example: '9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly documentCode!: string;

  @ApiProperty({
    description:
      '사용자가 서명한 XRPL 트랜잭션 해시 · 64자 hex (대문자). document_approvals.xrpl_tx_hash 컬럼과 동일 형식.',
    example: 'A5111111111111111111111111111111111111111111111111111111111111AA',
  })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64)
  @Matches(/^[0-9A-F]{64}$/, {
    message: 'xrplTxHash 는 64자의 대문자 hex 여야 합니다.',
  })
  readonly xrplTxHash!: string;
}
