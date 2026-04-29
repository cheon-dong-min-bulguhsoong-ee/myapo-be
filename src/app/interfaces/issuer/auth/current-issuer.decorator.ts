import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Issuer } from '../../../domain/issuer/entity/issuer.entity';

export const CurrentIssuer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Issuer => {
    const request = ctx.switchToHttp().getRequest();
    return request.issuer as Issuer;
  },
);
