import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { CredentialRequestStatus } from '../enum/credential-request-status.enum';
import { IssuerCode } from '../enum/issuer-code.enum';

export class CredentialRequest {
  constructor(
    public readonly id: bigint,
    public readonly bundleId: bigint,
    public readonly userId: bigint,
    public readonly issuerCode: IssuerCode,
    public readonly category: MyDataCategory,
    public readonly status: CredentialRequestStatus,
    public readonly failureReason: string | null,
    public readonly xrplTxHash: string | null,
    public readonly xrplLedgerIndex: bigint | null,
    public readonly payloadHash: string | null,
    public readonly requestedTtlMonths: number | null,
    public readonly requestedAt: Date,
    public readonly processedAt: Date | null,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get requestCode(): string {
    return `Q-${this.id.toString()}`;
  }
}
