import { MyDataCategory } from '../../mydata/enum/mydata-category.enum';
import { CredentialStatus } from '../enum/credential-status.enum';

export class Credential {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint,
    public readonly snapshotId: bigint,
    public readonly category: MyDataCategory,
    public readonly xrplTxHash: string,
    public readonly dataHash: string,
    public readonly metadataUri: string,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly status: CredentialStatus,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isActive(now: Date = new Date()): boolean {
    if (this.status !== CredentialStatus.ACTIVE) {
      return false;
    }
    return this.expiresAt.getTime() > now.getTime();
  }
}
