export class XrplCredentialIssueResult {
  constructor(
    public readonly txHash: string,
    public readonly resultCode: string,
    public readonly ledgerIndex: number | null,
    public readonly feeDrops: bigint | null,
    public readonly rawResponse: Record<string, unknown>,
  ) {}
}
