import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenProvider } from '../../../domain/common/contract/token-provider';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

@Injectable()
export class TokenProviderImpl implements TokenProvider {
  private readonly secret: string;
  private readonly expiresIn: string = '1h';

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET') || 'myapo-dev-secret-key-2026';
  }

  issueToken(payload: { sub: string; email: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' });
  }

  verifyToken(token: string): { sub: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return {
        sub: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new DomainError(ErrorCode.Auth.TOKEN_EXPIRED);
      }
      throw new DomainError(ErrorCode.Auth.TOKEN_INVALID);
    }
  }
}
