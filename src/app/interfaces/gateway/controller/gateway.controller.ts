import { Controller, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '../../../domain/gateway/service/gateway.service';
import { BaseResponse } from '../../common/response/base-response';
import { ApiBaseResponse } from '../../common/response/api-base-response.decorator';
import { GatewayVerifyResponse } from '../dto/response/gateway-verify.response';

@ApiTags('Gateway')
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
  ) {}

  @Post('verify/:address')
  @ApiOperation({
    summary: 'XLS-80 Permissioned Domain 입장 자격 검증',
    description: '사용자의 Credential 을 확인하여 Permissioned Domain 입장 가능 여부를 검증합니다.',
  })
  @ApiParam({ name: 'address', description: 'XRPL 주소', example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @ApiQuery({ name: 'requester', required: false, description: '요청자 식별자', example: 'bank-system' })
  @ApiQuery({ name: 'domainId', required: false, description: 'Permissioned Domain ID', example: 'domain-001' })
  @ApiBaseResponse(GatewayVerifyResponse)
  @ApiResponse({ status: 404, description: 'USER_NOT_FOUND', type: BaseResponse })
  async verify(
    @Param('address') address: string,
    @Query('requester') requester?: string,
    @Query('domainId') domainId?: string,
  ): Promise<BaseResponse<GatewayVerifyResponse>> {
    const result = await this.gatewayService.verify(
      address,
      requester ?? null,
      domainId ?? null,
    );
    return BaseResponse.success(GatewayVerifyResponse.from(result));
  }
}
