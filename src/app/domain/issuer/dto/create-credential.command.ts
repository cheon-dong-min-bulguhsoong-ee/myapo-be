import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { CredentialStatus } from '../enum/credential-status.enum';

export class CreateCredentialCommand {
  constructor(
    public readonly userId: bigint,
    public readonly snapshotId: bigint,
    public readonly category: MyDataCategory,
    public readonly xrplTxHash: string,
    public readonly dataHash: string,
    public readonly metadataUri: string,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly status: CredentialStatus = CredentialStatus.ACTIVE,
  ) {}
}
