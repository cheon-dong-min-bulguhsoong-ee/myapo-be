import { ApiProperty } from '@nestjs/swagger';
import { ApproveDocumentResult } from '../../../domain/document/dto/approve-document.result';
import { DocumentStage } from '../../../domain/document/enum/document-stage.enum';

/**
 * 문서 단계 승인 응답 Body.
 *
 * approvedStage = "이 승인이 통과시킨 다음 stage" (DocumentApproval.stage 와 동일).
 * 현재 documents.current_stage 는 본 API 에서 갱신하지 않으므로 응답에 포함하지 않는다.
 */
export class ApproveDocumentRes {
  @ApiProperty({
    description: '승인 처리된 문서의 외부 노출 코드 (UUID).',
    example: '9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  })
  readonly documentCode: string;

  @ApiProperty({
    enum: DocumentStage,
    description:
      '이 승인이 통과시킨 다음 stage. ' +
      'AUTHORITY_ISSUED → DOCUMENT_ARRIVED, …, APOSTILLE_ISSUED → WALLET_STORED.',
    example: DocumentStage.DOCUMENT_ARRIVED,
  })
  readonly approvedStage: DocumentStage;

  @ApiProperty({
    description: '사용자가 서명한 XRPL 트랜잭션 해시 (64자 hex).',
    example: 'A5111111111111111111111111111111111111111111111111111111111111AA',
  })
  readonly xrplTxHash: string;

  @ApiProperty({
    description: '서명 컨펌 시각 (ISO 8601, UTC).',
    example: '2026-05-06T03:00:00.000Z',
  })
  readonly approvedAt: string;

  constructor(
    documentCode: string,
    approvedStage: DocumentStage,
    xrplTxHash: string,
    approvedAt: string,
  ) {
    this.documentCode = documentCode;
    this.approvedStage = approvedStage;
    this.xrplTxHash = xrplTxHash;
    this.approvedAt = approvedAt;
  }

  static from(result: ApproveDocumentResult): ApproveDocumentRes {
    return new ApproveDocumentRes(
      result.documentCode,
      result.approvedStage,
      result.xrplTxHash,
      result.approvedAt.toISOString(),
    );
  }
}
