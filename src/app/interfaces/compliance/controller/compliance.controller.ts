import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ComplianceService } from '../../../domain/compliance/service/compliance.service';
import { ComplianceTrigger } from '../../../domain/compliance/enum/compliance-trigger.enum';
import { BaseResponse } from '../../common/response/base-response';
import { ApiBaseResponse } from '../../common/response/api-base-response.decorator';
import { ComplianceCheckRequest } from '../dto/request/compliance-check.request';
import { ComplianceCheckResponse } from '../dto/response/compliance-check.response';

@ApiTags('Compliance')
@Controller('api/v1/compliance')
export class ComplianceController {
  constructor(
    private readonly complianceService: ComplianceService,
  ) {}

  @Post('check/:address')
  @ApiOperation({
    summary: '리스크 평가 및 Deep Freeze 적용',
    description: '사용자 리스크를 평가하고, 필요 시 XLS-77d Deep Freeze 를 실행합니다.',
  })
  @ApiParam({ name: 'address', description: 'XRPL 주소', example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @ApiBaseResponse(ComplianceCheckResponse)
  @ApiResponse({ status: 404, description: 'USER_NOT_FOUND', type: BaseResponse })
  async check(
    @Param('address') address: string,
    @Body() request: ComplianceCheckRequest,
  ): Promise<BaseResponse<ComplianceCheckResponse>> {
    const trigger = request.triggeredBy ?? ComplianceTrigger.WEBHOOK;
    const result = await this.complianceService.checkAndApply(address, trigger);
    return BaseResponse.success(ComplianceCheckResponse.from(result));
  }
}
