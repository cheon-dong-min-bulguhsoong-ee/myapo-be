import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../../common/contract/token-provider';

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
  async verifyAccessToken(token: string): Promise<{ userId: bigint; email: string }> {
    const payload = this.tokenProvider.verifyToken(token);
    return {
      userId: BigInt(payload.sub),
      email: payload.email,
    };
  }
}
