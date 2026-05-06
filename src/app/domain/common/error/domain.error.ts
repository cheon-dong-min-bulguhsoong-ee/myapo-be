import { ErrorCode } from './error-code';

/**
 * 모든 도메인 에러의 단일 클래스.
 *
 * - 도메인 서비스 · 인터페이스 어디서든 `throw new DomainError(ErrorCode.X.Y, data)` 로 사용.
 * - ApiExceptionHandler 가 instanceof 한 번 체크 + errorCode 의 httpStatus·code·message 를 그대로 응답에 매핑.
 * - 별도 에러 서브클래스 (UserNotFoundError 등) 만들지 않음 — 카탈로그(ErrorCode) 가 그 역할.
 */
export class DomainError extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly data: Record<string, unknown> = {},
  ) {
    super(errorCode.message);
    this.name = 'DomainError';
  }
}
