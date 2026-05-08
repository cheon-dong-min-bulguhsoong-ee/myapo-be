import { Injectable } from "@nestjs/common";
import { AuthService } from "../../domain/auth/service/auth.service";
import { UserService } from "../../domain/user/service/user.service";
import { AuthRes } from "../../interfaces/auth/res/auth.res";

@Injectable()
export class AuthFacade {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 소셜 계정 정보를 확인하여 로그인 처리하고 자체 JWT를 발행한다.
   */
  async login(auth: {
    email: string;
    verifier: string;
    verifierId: string;
  }): Promise<AuthRes> {
    const result = await this.userService.login(
      auth.verifier,
      auth.verifierId,
      auth.email,
    );

    const accessToken = await this.authService.issueAccessToken(
      BigInt(result.id),
      result.email,
    );

    return AuthRes.fromResult(result, accessToken);
  }

  /**
   * 로그아웃 처리. (현재는 클라이언트 측 토큰 삭제로 충분하나, 확장을 위해 정의)
   */
  async logout(userId: bigint): Promise<void> {
    await this.authService.logout(userId);
  }
}
