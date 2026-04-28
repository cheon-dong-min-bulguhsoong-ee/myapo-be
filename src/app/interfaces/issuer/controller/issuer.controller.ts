import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { IssuerFacade } from '../../../application/issuer.facade';
import { CommonRes } from '../../common/common-res';
import { IssueCredentialReq } from '../req/issue-credential.req';
import { IssuerLoginReq } from '../req/issuer-login.req';
import { IssuerSignupReq } from '../req/issuer-signup.req';
import { IssueBundleRes } from '../res/issue-bundle.res';
import { IssuerAuthRes } from '../res/issuer-auth.res';
import {
  IssueCredentialBundleSwaggerApi,
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

  @Post('issue/:address')
  @IssueCredentialBundleSwaggerApi()
  async issue(
    @Param('address') address: string,
    @Body() _request: IssueCredentialReq,
  ): Promise<CommonRes<IssueBundleRes>> {
    const result = await this.issuerFacade.issueBundle(address);
    return CommonRes.success(IssueBundleRes.from(result));
  }
}
