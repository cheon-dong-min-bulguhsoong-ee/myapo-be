import { XrplCredentialTransactionKind } from "./xrpl-credential-evidence.result";

export class XrplCredentialTransactionPayloadResult {
  constructor(
    public readonly transactionKind: XrplCredentialTransactionKind,
    public readonly network: string,
    public readonly transaction: Record<string, unknown>,
  ) {}
}
