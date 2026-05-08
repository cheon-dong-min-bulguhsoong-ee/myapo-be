import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

interface DecodedGoogleIdToken extends jwt.JwtPayload {
  email: string;
  sub: string;
  aud: string;
  iss: string;
}

@Injectable()
export class Web3AuthGuard implements CanActivate {
  private client: jwksClient.JwksClient;
  private readonly googleOauthClientId: string;
  private readonly googleIssuer: string = 'https://accounts.google.com';

  constructor(private readonly configService: ConfigService) {
    this.client = jwksClient({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      cache: true,
      rateLimit: true,
    });
    this.googleOauthClientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID')!;
    if (!this.googleOauthClientId) {
      throw new Error('GOOGLE_OAUTH_CLIENT_ID is not defined in environment variables.');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new DomainError(ErrorCode.Auth.UNAUTHORIZED, {
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.verifyGoogleIdToken(token);
      
      // ADR-001: Strict 'aud' claim verification
      if (decodedToken.aud !== this.googleOauthClientId) {
        throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
          message: 'Invalid token audience (aud) claim.',
          expectedAud: this.googleOauthClientId,
          receivedAud: decodedToken.aud,
        });
      }

      // Verify 'iss' (issuer) claim
      if (decodedToken.iss !== this.googleIssuer) {
        throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
          message: 'Invalid token issuer (iss) claim.',
          expectedIss: this.googleIssuer,
          receivedIss: decodedToken.iss,
        });
      }

      // Inject validated token payload into request
      (request as any).web3auth = {
        email: decodedToken.email,
        verifier: 'google', // Currently only Google is supported via this Guard
        verifierId: decodedToken.sub,
      };

      return true;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
            message: error.message,
            name: error.name
        });
      }
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: 'Invalid Web3Auth token',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private verifyGoogleIdToken(token: string): Promise<DecodedGoogleIdToken> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        (header, callback) => {
          this.client.getSigningKey(header.kid, (err, key) => {
            if (err) {
              callback(err);
            } else {
              const signingKey = key?.getPublicKey();
              callback(null, signingKey);
            }
          });
        },
        { algorithms: ['RS256'] },
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          if (!decoded || typeof decoded === 'string') {
            return reject(new Error('Invalid token payload'));
          }
          resolve(decoded as DecodedGoogleIdToken);
        },
      );
    });
  }
}
