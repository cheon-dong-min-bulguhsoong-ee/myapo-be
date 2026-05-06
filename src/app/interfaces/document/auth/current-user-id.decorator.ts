import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

/**
 * X-User-Id 헤더에서 사용자 ID 를 꺼내 bigint 으로 변환한다.
 * JWT 가드 도입 전까지의 임시 인증 — 도입 후 제거.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): bigint => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const raw = request.header('x-user-id');
    if (raw === undefined || raw === '') {
      throw new DomainError(ErrorCode.Auth.USER_HEADER_MISSING);
    }
    if (!/^\d+$/.test(raw)) {
      throw new DomainError(ErrorCode.Auth.USER_HEADER_INVALID, { raw });
    }
    return BigInt(raw);
  },
);
