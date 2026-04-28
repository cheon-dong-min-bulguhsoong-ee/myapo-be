import { Body, Controller, Param, Post } from '@nestjs/common';
import { ComplianceFacade } from '../../../application/compliance.facade';
import { ComplianceTrigger } from '../../../domain/compliance/compliance-trigger.enum';
import { CommonRes } from '../../common/common-res';
import { ComplianceCheckReq } from '../req/compliance-check.req';
import { ComplianceCheckRes } from '../res/compliance-check.res';
import {
  ComplianceApiTags,
  ComplianceCheckSwaggerApi,
} from '../swagger/compliance.swagger.api';

@ComplianceApiTags()
@Controller('api/v1/compliance')
export class ComplianceController {
  constructor(private readonly complianceFacade: ComplianceFacade) {}

  @Post('check/:address')
  @ComplianceCheckSwaggerApi()
  async check(
    @Param('address') address: string,
    @Body() request: ComplianceCheckReq,
  ): Promise<CommonRes<ComplianceCheckRes>> {
    const trigger = request.triggeredBy ?? ComplianceTrigger.WEBHOOK;
    const result = await this.complianceFacade.checkAndApply(address, trigger);
    return CommonRes.success(ComplianceCheckRes.from(result));
  }
}
