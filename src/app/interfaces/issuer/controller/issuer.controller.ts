import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IssuerFacade } from '../../../application/issuer.facade';
import { CommonRes } from '../../common/common-res';
import { IssuerLoginReq } from '../req/issuer-login.req';
import { IssuerSignupReq } from '../req/issuer-signup.req';
import { IssuerAuthRes } from '../res/issuer-auth.res';
import {
  IssuerApiTags,
  IssuerLoginSwaggerApi,
  IssuerSignupSwaggerApi,
} from '../swagger/issuer.swagger.api';

@IssuerApiTags()
@Controller('api/v1/issuer')
export class IssuerController {
  constructor(private readonly issuerFacade: IssuerFacade) {}

  @Post('auth/signup')
  @HttpCode(HttpStatus.CREATED)
  @IssuerSignupSwaggerApi()
  async signup(
    @Body() request: IssuerSignupReq,
  ): Promise<CommonRes<IssuerAuthRes>> {
    const result = await this.issuerFacade.signup(
      request.issuerCode,
      request.adminId,
      request.password,
    );
    return CommonRes.success(IssuerAuthRes.from(result));
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @IssuerLoginSwaggerApi()
  async login(
    @Body() request: IssuerLoginReq,
  ): Promise<CommonRes<IssuerAuthRes>> {
    const result = await this.issuerFacade.login(
      request.issuerCode,
      request.adminId,
      request.password,
    );
    return CommonRes.success(IssuerAuthRes.from(result));
  }
}
