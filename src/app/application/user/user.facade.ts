import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user/service/user.service';
import { RegisterUserReq } from '../../interfaces/user/req/register-user.req';
import { UserRes } from '../../interfaces/user/res/user.res';

@Injectable()
export class UserFacade {
  constructor(private readonly userService: UserService) {}

  /**
   * 사용자 가입/복구 처리.
   */
  async register(
    req: RegisterUserReq,
    auth: { verifier: string; verifierId: string },
  ): Promise<UserRes> {
    const result = await this.userService.register({
      email: req.email,
      name: req.name,
      nationality: req.nationality,
      xrplAddress: req.xrplAddress,
      publicKey: req.publicKey,
      verifier: auth.verifier,
      verifierId: auth.verifierId,
    });
    return UserRes.from(result);
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
