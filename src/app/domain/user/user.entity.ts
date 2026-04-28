import { UserStatus } from './user-status.enum';

export class User {
  constructor(
    public readonly id: bigint,
    public readonly tossCi: string,
    public readonly tossDi: string | null,
    public readonly xrplAddress: string,
    public readonly encryptedSeed: string,
    public readonly kmsKeyId: string,
    public readonly status: UserStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isFrozen(): boolean {
    return this.status === UserStatus.FROZEN;
  }
}
