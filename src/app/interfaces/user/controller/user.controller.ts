import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UserFacade } from "../../../application/user/user.facade";
import { UserRole } from "../../../domain/user/enum/user-role.enum";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../infrastructure/auth/guards/roles.guard";
import { CommonRes } from "../../common/common-res";
import { Roles } from "../../auth/auth/roles.decorator";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { ChangeUserRoleReq } from "../req/change-user-role.req";
import { UserRes } from "../res/user.res";
import {
  ChangeUserRoleSwaggerApi,
  DeleteAccountSwaggerApi,
  GetMyProfileSwaggerApi,
  UserApiTags,
} from "../swagger/user.swagger.api";

@UserApiTags()
@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userFacade: UserFacade) {}

  /**
   * 내 정보 조회.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @GetMyProfileSwaggerApi()
  async getMe(@CurrentUserId() userId: bigint): Promise<CommonRes<UserRes>> {
    const result = await this.userFacade.getMyProfile(userId);
    return CommonRes.success(result);
  }

  /**
   * 회원 탈퇴 (Soft Delete).
   */
  @Delete("me")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteAccountSwaggerApi()
  async deleteMe(@CurrentUserId() userId: bigint): Promise<CommonRes<null>> {
    await this.userFacade.deleteAccount(userId);
    return CommonRes.success(null);
  }

  /**
   * 사용자 권한 변경 (Admin 전용).
   */
  @Patch(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ChangeUserRoleSwaggerApi()
  async changeRole(
    @Param("id", ParseIntPipe) targetUserId: number,
    @Body() req: ChangeUserRoleReq,
  ): Promise<CommonRes<UserRes>> {
    const result = await this.userFacade.changeUserRole(
      BigInt(targetUserId),
      req.role,
    );
    return CommonRes.success(result);
  }
}
