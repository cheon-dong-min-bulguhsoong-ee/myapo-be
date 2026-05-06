import { DocumentStage } from '../enum/document-stage.enum';
import { DocumentStatus } from '../enum/document-status.enum';

/**
 * 발급된 문서.
 *
 * 사용자 서명은 단계별 4번 (PRE_REVIEW · TRANSLATING · NOTARIZING · ISSUED) 누적.
 * 각 서명은 document_approvals 테이블에 1행씩 — 이 entity 에는 단일 컬럼 없음.
 * "모든 승인 완료 여부" = approvals 4개 모두 존재 = status=VALID.
 */
export class Document {
  constructor(
    public readonly id: bigint,
    public readonly documentCode: string,
    public readonly userId: bigint,
    public readonly documentTypeCode: string,
    public readonly status: DocumentStatus,
    public readonly currentStage: DocumentStage,
    public readonly failureReason: string | null,
    public readonly xrplCreateTxHash: string | null,
    public readonly xrplLedgerIndex: bigint | null,
    public readonly payloadHash: string | null,
    public readonly requestedAt: Date,
    public readonly issuedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
