/**
 * 개별 stage 이벤트(document_stages 행) 의 상태.
 *   PENDING     — 진입했지만 아직 진행 중인 상태
 *   DONE        — 정상 마감
 *   FAILED      — 실패 (terminal — failure_reason 채움)
 */
export enum DocumentMvpStageStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  FAILED = "FAILED",
}

/**
 * 응답에 같이 내려보낼 한글 라벨.
 */
export const DOCUMENT_MVP_STAGE_STATUS_LABELS: Record<
  DocumentMvpStageStatus,
  string
> = {
  [DocumentMvpStageStatus.PENDING]: "진행 중",
  [DocumentMvpStageStatus.DONE]: "완료",
  [DocumentMvpStageStatus.FAILED]: "실패",
};
