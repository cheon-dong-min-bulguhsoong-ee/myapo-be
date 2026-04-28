import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { IssueBundleRes } from '../res/issue-bundle.res';
import { IssuerAuthRes } from '../res/issuer-auth.res';

export const IssuerApiTags = () => ApiTags('Issuer');

export const IssuerSignupSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급자 콘솔 회원가입',
      description: '기관 코드와 담당자 ID, 비밀번호로 신규 발급자 관리자 계정을 생성합니다.',
    }),
    ApiCommonRes(IssuerAuthRes),
    ApiResponse({ status: 409, description: 'ERR_ISSUER_ADMIN_ALREADY_EXISTS', type: CommonRes }),
  );

export const IssuerLoginSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급자 콘솔 로그인',
      description: '기관/담당자 ID/비밀번호로 로그인하고 액세스 토큰을 발급합니다.',
    }),
    ApiCommonRes(IssuerAuthRes),
    ApiResponse({ status: 401, description: 'ERR_INVALID_CREDENTIALS', type: CommonRes }),
    ApiResponse({ status: 403, description: 'ERR_ISSUER_ADMIN_INACTIVE', type: CommonRes }),
  );

export const IssueCredentialBundleSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'XLS-70 Credential 일괄 발행',
      description: '마이데이터 스냅샷을 기반으로 XLS-70 Credential 을 일괄 발행합니다.',
    }),
    ApiParam({
      name: 'address',
      description: 'XRPL 주소',
      example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    }),
    ApiCommonRes(IssueBundleRes),
    ApiResponse({ status: 404, description: 'ERR_USER_NOT_FOUND', type: CommonRes }),
  );
