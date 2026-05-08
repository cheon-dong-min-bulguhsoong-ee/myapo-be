import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CredentialFacade } from '../../../application/credential/credential.facade';
import { CredentialStatus } from '../../../domain/credential/enum/credential-status.enum';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { CommonRes } from '../../common/common-res';
import { CurrentUserId } from '../../user/auth/current-user-id.decorator';
import { CreateCredentialIssueRequestReq } from '../req/create-credential-issue-request.req';
import { SubmitCredentialReq } from '../req/submit-credential.req';
import { CreateCredentialIssueRequestRes, CredentialIssueRequestRes } from '../res/credential-issue-request.res';
import { CredentialDetailRes, ListCredentialsRes } from '../res/credential.res';
import { ListCredentialSubmissionsRes, SubmitCredentialRes } from '../res/credential-submission.res';
import {
  CreateCredentialIssueRequestSwaggerApi,
  CredentialApiTags,
  GetCredentialDetailSwaggerApi,
  GetCredentialIssueRequestSwaggerApi,
  ListCredentialsSwaggerApi,
  ListCredentialSubmissionsSwaggerApi,
  SubmitCredentialSwaggerApi,
} from '../swagger/credential.swagger.api';

@CredentialApiTags()
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class CredentialController {
  constructor(private readonly credentialFacade: CredentialFacade) {}

  @Post('credentials/issue-requests')
  @CreateCredentialIssueRequestSwaggerApi()
  async createIssueRequest(
    @CurrentUserId() userId: bigint,
    @Body() request: CreateCredentialIssueRequestReq,
  ): Promise<CommonRes<CreateCredentialIssueRequestRes>> {
    const response = await this.credentialFacade.createIssueRequest(request, userId);
    return CommonRes.success(response);
  }

  @Get('credentials/issue-requests/:issueRequestId')
  @GetCredentialIssueRequestSwaggerApi()
  async getIssueRequest(
    @CurrentUserId() userId: bigint,
    @Param('issueRequestId') issueRequestId: string,
  ): Promise<CommonRes<CredentialIssueRequestRes>> {
    const response = await this.credentialFacade.getIssueRequest(userId, issueRequestId);
    return CommonRes.success(response);
  }

  @Get('credentials')
  @ListCredentialsSwaggerApi()
  async listCredentials(
    @CurrentUserId() userId: bigint,
    @Query('status') status?: CredentialStatus,
  ): Promise<CommonRes<ListCredentialsRes>> {
    const response = await this.credentialFacade.listCredentials(userId, status);
    return CommonRes.success(response);
  }

  @Get('credentials/:credentialId/submissions')
  @ListCredentialSubmissionsSwaggerApi()
  async listSubmissions(
    @CurrentUserId() userId: bigint,
    @Param('credentialId') credentialId: string,
  ): Promise<CommonRes<ListCredentialSubmissionsRes>> {
    const response = await this.credentialFacade.listSubmissions(userId, credentialId);
    return CommonRes.success(response);
  }

  @Get('credentials/:credentialId')
  @GetCredentialDetailSwaggerApi()
  async getCredentialDetail(
    @CurrentUserId() userId: bigint,
    @Param('credentialId') credentialId: string,
  ): Promise<CommonRes<CredentialDetailRes>> {
    const response = await this.credentialFacade.getCredentialDetail(userId, credentialId);
    return CommonRes.success(response);
  }

  @Post('credentials/:credentialId/submissions')
  @SubmitCredentialSwaggerApi()
  async submitCredential(
    @CurrentUserId() userId: bigint,
    @Param('credentialId') credentialId: string,
    @Body() request: SubmitCredentialReq,
  ): Promise<CommonRes<SubmitCredentialRes>> {
    const response = await this.credentialFacade.submitCredential(userId, credentialId, request);
    return CommonRes.success(response);
  }
}
