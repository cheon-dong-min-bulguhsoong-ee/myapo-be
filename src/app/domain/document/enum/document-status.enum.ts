/**
 * 문서 상태.
 *
 * 전이:
 *   PROGRESS              — 1~5 단계 파이프라인 진행 중
 *   → AWAITING_APPROVAL   — issuer 가 CredentialCreate 서명 완료, 사용자 승인 대기
 *   → VALID               — 사용자가 CredentialAccept 서명 → 지갑 사용 가능
 *   → EXPIRED / REVOKED   — terminal (만료 / 폐기)
 *   → FAILED              — terminal (어느 단계에서든 실패)
 */
export enum DocumentStatus {
  PROGRESS = 'PROGRESS',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  FAILED = 'FAILED',
}
