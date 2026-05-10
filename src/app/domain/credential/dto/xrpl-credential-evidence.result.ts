export enum XrplCredentialTransactionKind {
  CREATE = "CREATE",
  ACCEPT = "ACCEPT",
  DELETE = "DELETE",
}

export class XrplCredentialTransactionEvidenceResult {
  constructor(
    public readonly transactionKind: XrplCredentialTransactionKind,
    public readonly network: string,
    public readonly transactionHash: string,
    public readonly engineResult: string,
    public readonly ledgerIndex: bigint | null,
    public readonly validated: boolean,
    public readonly feeDrops: string | null,
    public readonly account: string,
    public readonly issuer: string | null,
    public readonly subject: string | null,
    public readonly credentialType: string,
    public readonly flags: number | null,
    public readonly objectSnapshot: Record<string, unknown> | null,
  ) {}
}

export class XrplCredentialObjectResult {
  constructor(
    public readonly ledgerEntryType: string,
    public readonly subject: string,
    public readonly issuer: string,
    public readonly credentialType: string,
    public readonly flags: number,
    public readonly expiration: number | null,
    public readonly uri: string | null,
    public readonly previousTxnId: string | null,
    public readonly previousTxnLedgerSequence: bigint | null,
  ) {}
}
