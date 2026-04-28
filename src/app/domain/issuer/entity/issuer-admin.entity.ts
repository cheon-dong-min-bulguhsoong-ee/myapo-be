import { IssuerCode } from '../enum/issuer-code.enum';

export class IssuerAdmin {
  constructor(
    public readonly id: bigint,
    public readonly issuerCode: IssuerCode,
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