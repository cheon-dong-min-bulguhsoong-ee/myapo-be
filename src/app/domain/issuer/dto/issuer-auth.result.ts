import { Issuer } from '../entity/issuer.entity';

export class IssuerAuthResult {
  constructor(
    public readonly issuer: Issuer,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}
