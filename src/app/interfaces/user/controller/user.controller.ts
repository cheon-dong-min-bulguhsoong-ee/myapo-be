import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserFacade } from '../../../application/user/user.facade';
import { CommonRes } from '../../common/common-res';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { Web3AuthInfo, Web3AuthPayload } from '../auth/web3auth-info.decorator';
import { RegisterUserReq } from '../req/register-user.req';
import { UserRes } from '../res/user.res';
import {
  DeleteAccountSwaggerApi,
  GetMyProfileSwaggerApi,
  RegisterUserSwaggerApi,
  UserApiTags,
} from '../swagger/user.swagger.api';

@UserApiTags()
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userFacade: UserFacade) {}

  /**
   * 사용자 가입 및 복구.
   */
  @Post('register')
  @RegisterUserSwaggerApi()
  async register(
    @Body() req: RegisterUserReq,
    @Web3AuthInfo() auth: Web3AuthPayload,
  ): Promise<CommonRes<UserRes>> {
    const result = await this.userFacade.register(req, auth);
    return CommonRes.success(result);
  }

  /**
   * 내 정보 조회.
   */
  @Get('me')
  @GetMyProfileSwaggerApi()
  async getMe(@CurrentUserId() userId: bigint): Promise<CommonRes<UserRes>> {
    const result = await this.userFacade.getMyProfile(userId);
    return CommonRes.success(result);
  }

  /**
   * 회원 탈퇴 (Soft Delete).
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteAccountSwaggerApi()
  async deleteMe(@CurrentUserId() userId: bigint): Promise<CommonRes<null>> {
    await this.userFacade.deleteAccount(userId);
    return CommonRes.success(null);
  }
}
