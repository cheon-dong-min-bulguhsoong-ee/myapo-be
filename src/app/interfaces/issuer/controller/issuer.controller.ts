import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IssuerFacade } from '../../../application/issuer.facade';
import { GetCredentialQueueCommand } from '../../../domain/issuer/dto/get-credential-queue.command';
import { Issuer } from '../../../domain/issuer/entity/issuer.entity';
import { CommonRes } from '../../common/common-res';
import { CurrentIssuer } from '../auth/current-issuer.decorator';
import { IssuerJwtGuard } from '../auth/issuer-jwt.guard';
import { CredentialQueueReq } from '../req/credential-queue.req';
import { IssuerLoginReq } from '../req/issuer-login.req';
import { IssuerSignupReq } from '../req/issuer-signup.req';
import { CredentialQueueRes } from '../res/credential-queue.res';
import { CredentialRequestDetailRes } from '../res/credential-request-detail.res';
import { IssuerAuthRes } from '../res/issuer-auth.res';
import {
  IssuerApiTags,
  IssuerLoginSwaggerApi,
  IssuerQueueDetailSwaggerApi,
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
      request.issuerName,
      request.walletAddress,
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
      request.adminId,
      request.password,
    );
    return CommonRes.success(IssuerAuthRes.from(result));
  }

  @Get('queue')
  @HttpCode(HttpStatus.OK)
  @UseGuards(IssuerJwtGuard)
  @IssuerQueueSwaggerApi()
  async getQueue(
    @Query() query: CredentialQueueReq,
    @CurrentIssuer() issuer: Issuer,
  ): Promise<CommonRes<CredentialQueueRes>> {
    const command = new GetCredentialQueueCommand(
      issuer.code,
      query.status ?? null,
      query.page ?? 1,
      query.limit ?? 20,
    );
    const result = await this.issuerFacade.getQueue(command);
    return CommonRes.success(CredentialQueueRes.from(result));
  }

  @Get('queue/:requestCode')
  @HttpCode(HttpStatus.OK)
  @UseGuards(IssuerJwtGuard)
  @IssuerQueueDetailSwaggerApi()
  async getQueueDetail(
    @Param('requestCode') requestCode: string,
    @CurrentIssuer() issuer: Issuer,
  ): Promise<CommonRes<CredentialRequestDetailRes>> {
    const result = await this.issuerFacade.getQueueDetail(requestCode, issuer);
    return CommonRes.success(CredentialRequestDetailRes.from(result));
  }
}
