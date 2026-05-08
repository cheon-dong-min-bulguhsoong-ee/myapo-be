import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../../domain/auth/service/auth.service";
import { UserService } from "../../domain/user/service/user.service";
import { RegisterUserReq } from "../../interfaces/user/req/register-user.req";
import { UserRes } from "../../interfaces/user/res/user.res";

@Injectable()
export class UserFacade {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * 사용자 가입/복구 처리 후 자체 JWT를 발행한다.
   */
  async register(
    req: RegisterUserReq,
    auth: { email: string; verifier: string; verifierId: string },
  ): Promise<UserRes & { accessToken: string }> {
    const result = await this.userService.register({
      email: auth.email,
      name: req.name,
      nationality: req.nationality,
      xrplAddress: req.xrplAddress,
      publicKey: req.publicKey,
      verifier: auth.verifier,
      verifierId: auth.verifierId,
    });

    const accessToken = await this.authService.issueAccessToken(
      BigInt(result.id),
      result.email,
    );

    return {
      ...UserRes.from(result),
      accessToken,
    };
  }

  /**
   * 내 정보 조회.
   */
  async getMyProfile(userId: bigint): Promise<UserRes> {
    const result = await this.userService.getProfile(userId);
    return UserRes.from(result);
  }

  /**
   * 회원 탈퇴.
   */
  async deleteAccount(userId: bigint): Promise<void> {
    await this.userService.delete(userId);
  }
}
