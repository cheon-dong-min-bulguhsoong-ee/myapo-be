import { IssuerAdmin } from '../entity/issuer-admin.entity';

export class IssuerAuthResult {
  constructor(
    public readonly admin: IssuerAdmin,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}