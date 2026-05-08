import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserFacade } from "../../../application/user/user.facade";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { Web3AuthGuard } from "../../../infrastructure/auth/guards/web3auth.guard";
import { CommonRes } from "../../common/common-res";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { Web3AuthInfo, Web3AuthPayload } from "../auth/web3auth-info.decorator";
import { RegisterUserReq } from "../req/register-user.req";
import { RegisterUserRes, UserRes } from "../res/user.res";
import {
  DeleteAccountSwaggerApi,
  GetMyProfileSwaggerApi,
  RegisterUserSwaggerApi,
  UserApiTags,
} from "../swagger/user.swagger.api";

@UserApiTags()
@Controller("api/v1/users")
export class UserController {
  constructor(private readonly userFacade: UserFacade) {}

  /**
   * 사용자 가입 및 복구.
   */
  @Post("register")
  @UseGuards(Web3AuthGuard)
  @RegisterUserSwaggerApi()
  async register(
    @Body() req: RegisterUserReq,
    @Web3AuthInfo() auth: Web3AuthPayload,
  ): Promise<CommonRes<RegisterUserRes>> {
    const result = await this.userFacade.register(req, auth);
    return CommonRes.success(result);
  }

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
}
