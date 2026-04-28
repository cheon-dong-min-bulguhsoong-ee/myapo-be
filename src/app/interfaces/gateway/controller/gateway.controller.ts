import { Controller, Param, Post, Query } from '@nestjs/common';
import { GatewayFacade } from '../../../application/gateway.facade';
import { CommonRes } from '../../common/common-res';
import { GatewayVerifyRes } from '../res/gateway-verify.res';
import {
  GatewayApiTags,
  GatewayVerifySwaggerApi,
} from '../swagger/gateway.swagger.api';

@GatewayApiTags()
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(private readonly gatewayFacade: GatewayFacade) {}

  @Post('verify/:address')
  @GatewayVerifySwaggerApi()
  async verify(
    @Param('address') address: string,
    @Query('requester') requester?: string,
    @Query('domainId') domainId?: string,
  ): Promise<CommonRes<GatewayVerifyRes>> {
    const result = await this.gatewayFacade.verify(
      address,
      requester ?? null,
      domainId ?? null,
    );
    return CommonRes.success(GatewayVerifyRes.from(result));
  }
}
