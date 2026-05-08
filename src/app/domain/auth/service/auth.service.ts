import { Injectable } from "@nestjs/common";
import { TokenProvider } from "../../common/contract/token-provider";

@Injectable()
export class AuthService {
  constructor(private readonly tokenProvider: TokenProvider) {}

  /**
   * 사용자 ID와 이메일을 바탕으로 내부 Access Token을 발행한다.
   */
  async issueAccessToken(userId: bigint, email: string): Promise<string> {
    return this.tokenProvider.issueToken({
      sub: userId.toString(),
      email,
    });
  }

  /**
   * Access Token의 유효성을 검증하고 페이로드를 반환한다.
   */
  async verifyAccessToken(
    token: string,
  ): Promise<{ userId: bigint; email: string }> {
    const payload = this.tokenProvider.verifyToken(token);
    return {
      userId: BigInt(payload.sub),
      email: payload.email,
    };
  }

  /**
   * 로그아웃을 수행한다.
   * 현재는 Stateless 환경이므로 별도 처리가 없으나, 향후 블랙리스트 등을 도입할 지점이다.
   */
  async logout(userId: bigint): Promise<void> {
    // TODO: Redis 블랙리스트 등을 이용한 토큰 무효화 로직 추가 가능
    return;
  }
}
