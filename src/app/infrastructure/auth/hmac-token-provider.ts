import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  IssuedToken,
  TokenPayload,
  TokenProvider,
} from '../../domain/common/contract/token-provider';

const DEFAULT_TTL_SECONDS = 60 * 60 * 12;
const DEFAULT_DEV_SECRET = 'auth-dev-secret-change-me';

@Injectable()
export class HmacTokenProvider extends TokenProvider {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(config: ConfigService) {
    super();
    this.secret = config.get<string>('AUTH_TOKEN_SECRET') ?? DEFAULT_DEV_SECRET;
    const ttl = Number(config.get<string>('AUTH_TOKEN_TTL_SECONDS'));
    this.ttlSeconds =
      Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_SECONDS;
  }

  sign(subject: string, meta: Record<string, unknown>): IssuedToken {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + this.ttlSeconds;
    const payload: TokenPayload = { subject, meta, iat, exp };
    const encoded = this.b64url(JSON.stringify(payload));
    const signature = this.b64url(this.hmac(encoded));
    return {
      token: `${encoded}.${signature}`,
      expiresAt: new Date(exp * 1000),
    };
  }

  verify(token: string): TokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const [encoded, signature] = parts;
    const expected = this.b64url(this.hmac(encoded));
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(this.fromB64url(encoded)) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  }

  private hmac(input: string): Buffer {
    return createHmac('sha256', this.secret).update(input).digest();
  }

  private b64url(input: string | Buffer): string {
    const buf = typeof input === 'string' ? Buffer.from(input) : input;
    return buf
      .toString('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private fromB64url(input: string): string {
    const padded = input
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
    return Buffer.from(padded, 'base64').toString('utf8');
  }
}
