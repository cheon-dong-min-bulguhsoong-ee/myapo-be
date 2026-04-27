import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IssuerService } from '../../../domain/issuer/service/issuer.service';
import { BaseResponse } from '../../common/response/base-response';
import { ApiBaseResponse } from '../../common/response/api-base-response.decorator';
import { IssueCredentialRequest } from '../dto/request/issue-credential.request';
import { IssueBundleResponse } from '../dto/response/issue-bundle.response';

@ApiTags('Issuer')
@Controller('api/v1/issuer')
export class IssuerController {
  constructor(
    private readonly issuerService: IssuerService,
  ) {}

  @Post('issue/:address')
  @ApiOperation({
    summary: 'XLS-70 Credential 일괄 발행',
    description: '마이데이터 스냅샷을 기반으로 XLS-70 Credential 을 일괄 발행합니다.',
  })
  @ApiParam({ name: 'address', description: 'XRPL 주소', example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @ApiBaseResponse(IssueBundleResponse)
  @ApiResponse({ status: 404, description: 'USER_NOT_FOUND', type: BaseResponse })
  async issue(
    @Param('address') address: string,
    @Body() _request: IssueCredentialRequest,
  ): Promise<BaseResponse<IssueBundleResponse>> {
    const result = await this.issuerService.issueBundle(address);
    return BaseResponse.success(IssueBundleResponse.from(result));
  }
}
