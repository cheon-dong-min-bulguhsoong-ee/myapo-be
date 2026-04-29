import { CredentialBundleStatus } from '../enum/credential-bundle-status.enum';

export class CredentialBundle {
  constructor(
    public readonly id: bigint,
    public readonly bundleCode: string,
    public readonly userId: bigint,
    public readonly status: CredentialBundleStatus,
    public readonly totalCount: number,
    public readonly completedCount: number,
    public readonly failedCount: number,
    public readonly requestedAt: Date,
    public readonly completedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
