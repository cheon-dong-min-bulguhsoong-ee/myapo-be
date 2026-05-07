import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

export interface Web3AuthPayload {
  email: string;
  verifier: string;
  verifierId: string;
}

/**
 * 인증 토큰에서 Web3Auth 관련 정보(email, verifier, verifierId)를 추출한다.
 * Web3AuthGuard가 요청 객체에 주입한 정보를 사용한다.
 */
export const Web3AuthInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Web3AuthPayload => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request.web3auth;

    if (!payload) {
      throw new DomainError(ErrorCode.Common.INTERNAL_SERVER_ERROR, {
        message: 'Web3AuthPayload not found in request. Ensure Web3AuthGuard is applied.',
      });
    }

    return payload;
  },
);
