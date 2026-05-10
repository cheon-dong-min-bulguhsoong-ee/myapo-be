import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthFacade } from "../../../application/auth/auth.facade";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { Web3AuthGuard } from "../../../infrastructure/auth/guards/web3auth.guard";
import { CommonRes } from "../../common/common-res";
import { CurrentUserId } from "../../user/auth/current-user-id.decorator";
import {
  Web3AuthInfo,
  Web3AuthPayload,
} from "../../user/auth/web3auth-info.decorator";
import { SignInReq } from "../req/signin.req";
import { AuthRes } from "../res/auth.res";
import {
  AuthApiTags,
  LogoutSwaggerApi,
  SignInSwaggerApi,
} from "../swagger/auth.swagger.api";

@AuthApiTags()
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  /**
   * 통합 로그인/회원가입.
   */
  @Post("signin")
  @UseGuards(Web3AuthGuard)
  @SignInSwaggerApi()
  async signin(
    @Web3AuthInfo() auth: Web3AuthPayload,
    @Body() req: SignInReq,
  ): Promise<CommonRes<AuthRes>> {
    const result = await this.authFacade.signIn({
      ...auth,
      ...req,
    });
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
