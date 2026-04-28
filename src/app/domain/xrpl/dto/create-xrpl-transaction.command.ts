import { XrplTxType } from '../enum/xrpl-tx-type.enum';

export class CreateXrplTransactionCommand {
  constructor(
    public readonly userId: bigint | null,
    public readonly txHash: string,
    public readonly txType: XrplTxType,
    public readonly account: string,
    public readonly resultCode: string,
    public readonly rawResponse: Record<string, unknown>,
    public readonly subject: string | null = null,
    public readonly feeDrops: bigint | null = null,
    public readonly ledgerIndex: bigint | null = null,
    public readonly submittedAt: Date | null = null,
  ) {}
}
