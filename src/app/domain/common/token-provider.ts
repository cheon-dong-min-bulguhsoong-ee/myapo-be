export interface IssuedToken {
  token: string;
  expiresAt: Date;
}

export interface TokenPayload {
  subject: string;
  meta: Record<string, unknown>;
  iat: number;
  exp: number;
}

export abstract class TokenProvider {
  abstract sign(subject: string, meta: Record<string, unknown>): IssuedToken;
  abstract verify(token: string): TokenPayload | null;
}
