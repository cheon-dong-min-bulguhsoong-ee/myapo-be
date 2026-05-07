import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStatus} from '../enum/document-status.enum';

/**
 * 문서 단계 전이 결과.
 *
 * advance API 호출로 documents.current_stage 가 다음 stage 로 갱신된 직후의 스냅샷.
 * - currentStage: 전이 후 stage
 * - status: 전이 후 status (WALLET_STORED 도달 시 VALID, 그 외엔 AWAITING_APPROVAL 유지)
 * - issuedAt: WALLET_STORED 도달 시점에만 채워짐 (그 외 null)
 */
export class AdvanceDocumentStageResult {
    constructor(
        public readonly documentCode: string,
        public readonly currentStage: DocumentStage,
        public readonly status: DocumentStatus,
        public readonly issuedAt: Date | null,
    ) {
    }
}
