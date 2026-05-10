import { DocumentStage } from "../enum/document-stage.enum";

/**
 * 사용자 승인 이벤트 1건.
 *
 * stage = "이 승인이 통과시킨 다음 stage" — DocumentApproval 테이블 컨벤션.
 * 한 문서당 4건 누적되면 모든 단계 승인 완료(WALLET_STORED 진입 직전).
 */
export class DocumentApproval {
  constructor(
    public readonly id: bigint,
    public readonly documentId: bigint,
    public readonly stage: DocumentStage,
    public readonly xrplTxHash: string,
    public readonly approvedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
