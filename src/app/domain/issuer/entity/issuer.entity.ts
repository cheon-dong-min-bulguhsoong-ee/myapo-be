import { IssuerCode } from '../enum/issuer-code.enum';

export class Issuer {
  constructor(
    public readonly code: IssuerCode,
    public readonly name: string,
    public readonly walletAddress: string,
    public readonly adminId: string,
    public readonly passwordHash: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
