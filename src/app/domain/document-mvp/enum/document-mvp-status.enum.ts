/**
 * 문서 발급 라이프사이클 상태 — MVP 단순화 버전.
 *
 *   IN_PIPELINE          — 1~5 단계 파이프라인 진행 중
 *   AWAITING_USER_APPROVAL — 다음 단계 진행을 위해 사용자 입력 대기 (FE 가 advance 호출하기 전)
 *   VALID                — APOSTILLE_DOC_ISSUED 도달, 발급 완료
 *   FAILED               — 어느 단계에서든 실패 (terminal)
 */
export enum DocumentMvpStatus {
  IN_PIPELINE = "IN_PIPELINE",
  AWAITING_USER_APPROVAL = "AWAITING_USER_APPROVAL",
  VALID = "VALID",
  FAILED = "FAILED",
}

/**
 * 응답에 같이 내려보낼 한글 라벨.
 */
export const DOCUMENT_MVP_STATUS_LABELS: Record<DocumentMvpStatus, string> = {
  [DocumentMvpStatus.IN_PIPELINE]: "진행 중",
  [DocumentMvpStatus.AWAITING_USER_APPROVAL]: "사용자 확인 대기",
  [DocumentMvpStatus.VALID]: "발급 완료",
  [DocumentMvpStatus.FAILED]: "실패",
};
