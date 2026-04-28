import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { GatewayVerifyRes } from '../res/gateway-verify.res';

export const GatewayApiTags = () => ApiTags('Gateway');

export const GatewayVerifySwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'XLS-80 Permissioned Domain 입장 자격 검증',
      description:
        '사용자의 Credential 을 확인하여 Permissioned Domain 입장 가능 여부를 검증합니다.',
    }),
    ApiParam({
      name: 'address',
      description: 'XRPL 주소',
      example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    }),
    ApiQuery({
      name: 'requester',
      required: false,
      description: '요청자 식별자',
      example: 'bank-system',
    }),
    ApiQuery({
      name: 'domainId',
      required: false,
      description: 'Permissioned Domain ID',
      example: 'domain-001',
    }),
    ApiCommonRes(GatewayVerifyRes),
    ApiResponse({ status: 404, description: 'ERR_USER_NOT_FOUND', type: CommonRes }),
  );
