import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { CredentialQueueRes } from '../res/credential-queue.res';
import { CredentialRequestDetailRes } from '../res/credential-request-detail.res';
import { IssuerAuthRes } from '../res/issuer-auth.res';

export const IssuerApiTags = () => ApiTags('Issuer');

export const IssuerSignupSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급자 콘솔 회원가입',
      description:
        '기관 코드 / 한국어 표시 이름 / XRPL 발급 지갑 주소 / 담당자 ID / 비밀번호로 신규 발급기관을 등록. 첫 가입자가 issuers 테이블 row 생성, 동일 issuerCode 재가입은 ALREADY_REGISTERED, 동일 adminId 다른 곳 사용 중이면 ADMIN_ID_TAKEN.',
    }),
    ApiCommonRes(IssuerAuthRes),
    ApiResponse({
      status: 409,
      description: 'ERR_ISSUER_ALREADY_REGISTERED · ERR_ISSUER_ADMIN_ID_TAKEN',
      type: CommonRes,
    }),
  );

export const IssuerLoginSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '발급자 콘솔 로그인',
      description:
        '담당자 ID / 비밀번호로 로그인. adminId 는 시스템 전역 unique 라 issuerCode 입력 불필요. 응답 accessToken 을 다른 issuer API 의 Authorization: Bearer 에 사용.',
    }),
    ApiCommonRes(IssuerAuthRes),
    ApiResponse({ status: 401, description: 'ERR_INVALID_CREDENTIALS', type: CommonRes }),
    ApiResponse({ status: 403, description: 'ERR_ISSUER_INACTIVE', type: CommonRes }),
  );

export const IssuerQueueSwaggerApi = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '발급자 콘솔 · 발급 대기 큐 조회',
      description:
        'S2-02 발급자 콘솔용. JWT 의 issuerCode 로 자기 기관 큐만 조회 + 상단 통계(대기/완료/24h 실패/폐기) 동봉. page/limit/status 만 query, issuer 식별은 토큰 기반.',
    }),
    ApiCommonRes(CredentialQueueRes),
    ApiResponse({ status: 401, description: 'ERR_ISSUER_UNAUTHORIZED', type: CommonRes }),
  );

export const IssuerQueueDetailSwaggerApi = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '발급자 콘솔 · 발급 요청 단건 상세 조회',
      description:
        'S2-03 발급 모달용. requestCode (= credential_requests.id) 를 path 로 받아 holder 메타 + 요청 메타 + Credential 본문 프리뷰(해시·tx hash 포함) 를 반환. JWT 의 issuerCode 와 일치하는 row 만 조회 (다른 issuer 거면 NOT_FOUND).',
    }),
    ApiParam({ name: 'requestCode', example: '1' }),
    ApiCommonRes(CredentialRequestDetailRes),
    ApiResponse({
      status: 400,
      description: 'ERR_INVALID_REQUEST_CODE',
      type: CommonRes,
    }),
    ApiResponse({ status: 401, description: 'ERR_ISSUER_UNAUTHORIZED', type: CommonRes }),
    ApiResponse({
      status: 404,
      description: 'ERR_CREDENTIAL_REQUEST_NOT_FOUND',
      type: CommonRes,
    }),
  );
