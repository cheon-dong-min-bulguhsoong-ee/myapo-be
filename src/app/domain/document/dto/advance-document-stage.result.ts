import { DocumentStage } from "../enum/document-stage.enum";
import { DocumentStatus } from "../enum/document-status.enum";

/**
 * 문서 단계 승인 + 전이 결과.
 *
 * "사용자 승인(DocumentApproval INSERT) + 단계 전이(documents.current_stage 갱신)"
 * 두 액션을 한 API 로 묶어서 처리한 직후의 스냅샷.
 *
 * - approvedStage: 이 호출이 통과시킨 다음 stage (DocumentApproval.stage 와 동일).
 * - currentStage: 전이 후 stage — 정상 흐름에선 approvedStage 와 같다.
 * - status: 전이 후 status (WALLET_STORED 도달 시 VALID, 그 외엔 AWAITING_APPROVAL 유지).
 * - issuedAt: WALLET_STORED 도달 시점에만 채워짐, 그 외 null.
 * - xrplTxHash / approvedAt: DocumentApproval 행에 기록된 사용자 서명 증거.
 */
export class AdvanceDocumentStageResult {
  constructor(
    public readonly documentCode: string,
    public readonly approvedStage: DocumentStage,
    public readonly currentStage: DocumentStage,
    public readonly status: DocumentStatus,
    public readonly issuedAt: Date | null,
    public readonly xrplTxHash: string,
    public readonly approvedAt: Date,
  ) {}
}
