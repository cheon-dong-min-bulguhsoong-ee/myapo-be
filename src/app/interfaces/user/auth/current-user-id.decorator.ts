import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

/**
 * X-User-Id 헤더에서 사용자 ID를 꺼내 bigint으로 변환한다.
 * (JWT 가드 도입 전까지의 임시 인증)
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): bigint => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // 1. JwtAuthGuard가 주입한 유저 정보 확인
    const user = (request as any).user;
    if (user && user.id) {
      return BigInt(user.id);
    }

    // 2. Legacy/Test를 위한 X-User-Id 헤더 확인
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
