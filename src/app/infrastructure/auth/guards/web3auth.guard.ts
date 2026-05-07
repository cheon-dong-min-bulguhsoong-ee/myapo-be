import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { DomainError } from '../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../domain/common/error/error-code';

@Injectable()
export class Web3AuthGuard implements CanActivate {
  private client: jwksClient.JwksClient;

  constructor() {
    this.client = jwksClient({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      cache: true,
      rateLimit: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.verifyToken(token);
      
      // ADR-001: Extract email and sub (verifierId) from payload
      (request as any).web3auth = {
        email: decodedToken.email,
        verifier: 'google',
        verifierId: decodedToken.sub,
      };

      return true;
    } catch (error) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: 'Invalid Web3Auth token',
        error: error.message,
      });
    }
  }

  private verifyToken(token: string): Promise<any> {
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
            reject(err);
          } else {
            resolve(decoded);
          }
        },
      );
    });
  }
}
