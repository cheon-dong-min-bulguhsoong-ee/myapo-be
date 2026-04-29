import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { CredentialQueueRes } from '../res/credential-queue.res';
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

export const IssuerQueueSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급자 콘솔 · 발급 대기 큐 조회',
      description:
        'S2-02 발급자 콘솔용. 출처(issuer) 별로 발급 요청 큐를 조회하고 상단 통계(대기/완료/24h 실패/폐기) 와 함께 반환합니다. cursor 기반 페이지네이션.',
    }),
    ApiCommonRes(CredentialQueueRes),
  );
