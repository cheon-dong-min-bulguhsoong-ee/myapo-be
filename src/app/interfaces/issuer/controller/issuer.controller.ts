import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { IssuerFacade } from '../../../application/issuer.facade';
import { GetCredentialQueueCommand } from '../../../domain/issuer/dto/get-credential-queue.command';
import { CommonRes } from '../../common/common-res';
import { CredentialQueueReq } from '../req/credential-queue.req';
import { IssuerLoginReq } from '../req/issuer-login.req';
import { IssuerSignupReq } from '../req/issuer-signup.req';
import { CredentialQueueRes } from '../res/credential-queue.res';
import { IssuerAuthRes } from '../res/issuer-auth.res';
import {
  IssuerApiTags,
  IssuerLoginSwaggerApi,
  IssuerQueueSwaggerApi,
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

  @Get('queue')
  @HttpCode(HttpStatus.OK)
  @IssuerQueueSwaggerApi()
  async getQueue(
    @Query() query: CredentialQueueReq,
  ): Promise<CommonRes<CredentialQueueRes>> {
    const command = new GetCredentialQueueCommand(
      query.issuer,
      query.status ?? null,
      query.page ?? 1,
      query.limit ?? 20,
    );
    const result = await this.issuerFacade.getQueue(command);
    return CommonRes.success(CredentialQueueRes.from(result));
  }
}
