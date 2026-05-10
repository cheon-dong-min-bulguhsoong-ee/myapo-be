import { DocumentStage } from "../enum/document-stage.enum";
import { DocumentStatus } from "../enum/document-status.enum";

/**
 * 발급된 문서.
 *
 * 5개 stage(AUTHORITY_ISSUED · DOCUMENT_ARRIVED · TRANSLATED_NOTARIZED · APOSTILLE_ISSUED · WALLET_STORED)를
 * 순차로 거치며, 각 stage 사이마다 "크리덴셜 생성 → 사용자 승인" 사이클이 1번씩 발생한다.
 * 사용자 서명은 stage 전이 4번 누적되어 document_approvals 에 4행으로 쌓이고,
 * 모든 승인 완료(approvals 4건) 시 status=VALID 로 도달한다.
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
