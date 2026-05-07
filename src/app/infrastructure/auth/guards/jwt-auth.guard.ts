import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../../domain/auth/service/auth.service';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new DomainError(ErrorCode.Auth.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.authService.verifyAccessToken(token);
      
      // Inject user information into the request object
      (request as any).user = {
        id: payload.userId,
        email: payload.email,
      };

      return true;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
        error: error.message,
      });
    }
  }
}
