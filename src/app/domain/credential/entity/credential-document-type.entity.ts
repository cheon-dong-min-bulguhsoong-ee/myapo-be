export class CredentialDocumentType {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly issuerCode: string,
    public readonly defaultTtlMonths: number,
  ) {}
}
