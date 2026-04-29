import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CredentialFacade } from '../../../application/credential.facade';
import { CommonRes } from '../../common/common-res';
import { RequestCredentialReq } from '../req/request-credential.req';
import { CredentialBundleRes } from '../res/credential-bundle.res';
import {
  CredentialsApiTags,
  RequestCredentialSwaggerApi,
} from '../swagger/credentials.swagger.api';

@CredentialsApiTags()
@Controller('api/v1/credentials')
export class CredentialsController {
  constructor(private readonly credentialFacade: CredentialFacade) {}

  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  @RequestCredentialSwaggerApi()
  async requestIssue(
    @Body() request: RequestCredentialReq,
  ): Promise<CommonRes<CredentialBundleRes>> {
    const result = await this.credentialFacade.requestBundle(
      request.xrplAddress,
      request.issuers,
    );
    return CommonRes.success(CredentialBundleRes.from(result));
  }
}
