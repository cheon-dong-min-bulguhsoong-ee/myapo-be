/**
 * 인증 토큰(JWT) 발행 및 검증을 위한 인터페이스.
 * 도메인 레이어는 이 인터페이스에 의존하며, 실제 구현은 인프라 레이어에서 수행한다.
 */
export abstract class TokenProvider {
  /**
   * 사용자 정보를 기반으로 액세스 토큰을 발행한다.
   */
  abstract issueToken(payload: { sub: string; email: string }): string;

  /**
   * 토큰의 유효성을 검증하고 페이로드를 반환한다.
   */
  abstract verifyToken(token: string): { sub: string; email: string };
}
