import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { ComplianceCheckRes } from '../res/compliance-check.res';

export const ComplianceApiTags = () => ApiTags('Compliance');

export const ComplianceCheckSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '리스크 평가 및 Deep Freeze 적용',
      description: '사용자 리스크를 평가하고, 필요 시 XLS-77d Deep Freeze 를 실행합니다.',
    }),
    ApiParam({
      name: 'address',
      description: 'XRPL 주소',
      example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    }),
    ApiCommonRes(ComplianceCheckRes),
    ApiResponse({ status: 404, description: 'ERR_USER_NOT_FOUND', type: CommonRes }),
  );
