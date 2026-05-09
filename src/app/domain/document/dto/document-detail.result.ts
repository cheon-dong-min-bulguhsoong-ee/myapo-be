import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStageStatus} from '../enum/document-stage-status.enum';
import {DocumentStatus} from '../enum/document-status.enum';

/**
 * 5단계 파이프라인 중 1단계의 이벤트 스냅샷.
 * `status === null` 은 아직 시작도 안 된 단계 — DocumentStage 행이 없음.
 */
export class DocumentStageDetailResult {
    constructor(
        public readonly stage: DocumentStage,
        public readonly status: DocumentStageStatus | null,
        public readonly startedAt: Date | null,
        public readonly completedAt: Date | null,
        public readonly failureReason: string | null,
    ) {
    }
}

/**
 * 사용자 승인 1건. stage = "이 승인이 통과시킨 다음 stage" (DocumentApproval 컨벤션 그대로).
 */
export class DocumentApprovalDetailResult {
    constructor(
        public readonly stage: DocumentStage,
        public readonly xrplTxHash: string,
        public readonly approvedAt: Date,
    ) {
    }
}

/**
 * 와이어프레임 connector 의 sub-step.
 *   CREDENTIAL_GENERATING — "크리덴셜 생성" 단계 (서버가 다음 stage 의 크리덴셜 준비 중)
 *   AWAITING_USER_APPROVAL — "사용자 승인" 단계 (사용자 서명 대기)
 *   null                  — 진행 중인 sub-step 없음 (terminal 또는 stage 막 전이된 직후)
 */
export type DocumentSubstep = 'CREDENTIAL_GENERATING' | 'AWAITING_USER_APPROVAL';

/**
 * 문서 관리 페이지에서 행을 펼쳤을 때 표시할 상세 — 리스트 항목 + 5-stage 파이프라인.
 */
export class DocumentDetailResult {
    constructor(
        public readonly documentCode: string,
        public readonly memberCode: string,
        public readonly requesterName: string,
        public readonly requesterEmail: string,
        public readonly documentTypeCode: string,
        public readonly documentTypeName: string,
        public readonly countryCode: string,
        public readonly requestedAt: Date,
        public readonly issuedAt: Date | null,
        public readonly status: DocumentStatus,
        public readonly currentStage: DocumentStage,
        public readonly currentSubstep: DocumentSubstep | null,
        public readonly stages: DocumentStageDetailResult[],
        public readonly approvals: DocumentApprovalDetailResult[],
    ) {
    }
}
