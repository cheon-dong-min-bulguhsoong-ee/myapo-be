import { DocumentStage } from "../enum/document-stage.enum";

/**
 * 문서 단계 승인 결과.
 *
 * approvedStage = "이 승인이 통과시킨 다음 stage" — DocumentApproval.stage 와 동일 의미.
 * 현 구현에서는 documents.current_stage 는 갱신하지 않으므로,
 * 응답에는 별도의 currentStage 필드를 두지 않는다 (별도 stage 전이 처리에서 다룸).
 */
export class ApproveDocumentResult {
  constructor(
    public readonly documentCode: string,
    public readonly approvedStage: DocumentStage,
    public readonly xrplTxHash: string,
    public readonly approvedAt: Date,
  ) {}
}
