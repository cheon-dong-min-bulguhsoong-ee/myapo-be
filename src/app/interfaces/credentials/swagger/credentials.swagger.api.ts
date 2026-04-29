import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { CredentialBundleRes } from '../res/credential-bundle.res';

export const CredentialsApiTags = () => ApiTags('Credentials');

export const RequestCredentialSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급 요청 큐 등록',
      description:
        '사용자가 선택한 출처별 Credential 발급 요청을 PENDING 상태로 큐에 적재하고, SSE 구독용 bundleCode 와 큐 상세를 반환합니다.',
    }),
    ApiCommonRes(CredentialBundleRes),
    ApiResponse({
      status: 404,
      description: 'ERR_USER_NOT_FOUND',
      type: CommonRes,
    }),
    ApiResponse({
      status: 403,
      description: 'ERR_USER_NOT_ACTIVE',
      type: CommonRes,
    }),
  );
