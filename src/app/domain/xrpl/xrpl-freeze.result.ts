export class XrplFreezeResult {
  constructor(
    public readonly txHash: string,
    public readonly resultCode: string,
    public readonly rawResponse: Record<string, unknown>,
  ) {}
}
