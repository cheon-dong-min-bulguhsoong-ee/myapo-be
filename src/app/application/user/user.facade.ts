import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../../domain/auth/service/auth.service";
import { UserService } from "../../domain/user/service/user.service";
import { UserRes } from "../../interfaces/user/res/user.res";

@Injectable()
export class UserFacade {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * 사용자 권한 변경 (Admin 전용).
   */
  async changeUserRole(
    targetUserId: bigint,
    newRole: string,
  ): Promise<UserRes> {
    const result = await this.userService.changeRole(
      targetUserId,
      newRole as any,
    );
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
