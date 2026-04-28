import { XrplTxType } from '../enum/xrpl-tx-type.enum';

export class XrplTransaction {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint | null,
    public readonly txHash: string,
    public readonly txType: XrplTxType,
    public readonly account: string,
    public readonly subject: string | null,
    public readonly resultCode: string,
    public readonly feeDrops: bigint | null,
    public readonly ledgerIndex: bigint | null,
    public readonly rawResponse: Record<string, unknown>,
    public readonly submittedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
