import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthFacade } from "../../../application/auth/auth.facade";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { Web3AuthGuard } from "../../../infrastructure/auth/guards/web3auth.guard";
import { CommonRes } from "../../common/common-res";
import { CurrentUserId } from "../../user/auth/current-user-id.decorator";
import {
  Web3AuthInfo,
  Web3AuthPayload,
} from "../../user/auth/web3auth-info.decorator";
import { AuthRes } from "../res/auth.res";
import {
  AuthApiTags,
  LoginSwaggerApi,
  LogoutSwaggerApi,
} from "../swagger/auth.swagger.api";

@AuthApiTags()
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  /**
   * 로그인.
   */
  @Post("login")
  @UseGuards(Web3AuthGuard)
  @LoginSwaggerApi()
  async login(
    @Web3AuthInfo() auth: Web3AuthPayload,
  ): Promise<CommonRes<AuthRes>> {
    const result = await this.authFacade.login(auth);
    return CommonRes.success(result);
  }

  /**
   * 로그아웃.
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @LogoutSwaggerApi()
  async logout(@CurrentUserId() userId: bigint): Promise<CommonRes<null>> {
    await this.authFacade.logout(userId);
    return CommonRes.success(null);
  }
}
