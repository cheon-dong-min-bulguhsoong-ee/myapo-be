import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Web3AuthPayload {
  verifier: string;
  verifierId: string;
}

/**
 * 인증 토큰에서 Web3Auth 관련 정보(verifier, verifierId)를 추출한다.
 */
export const Web3AuthInfo = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext): Web3AuthPayload => {
    // TODO: 실제 구현 시 Guard에서 검증된 토큰 정보를 요청 객체에서 꺼내온다.
    // MVP 데모를 위해 우선 Google 고정 값을 반환한다.
    return {
      verifier: 'google',
      verifierId: 'google-oauth2|123456789',
    };
  },
);
