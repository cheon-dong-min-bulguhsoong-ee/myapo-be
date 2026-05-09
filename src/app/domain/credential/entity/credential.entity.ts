import { CredentialStatus } from '../enum/credential-status.enum';

export class Credential {
  constructor(
    public readonly id: bigint,
    public readonly credentialCode: string,
    public readonly issueRequestId: bigint,
    public readonly issueRequestCode: string,
    public readonly userId: bigint,
    public readonly documentTypeCode: string,
    public readonly documentTypeName: string,
    public readonly issuerCode: string,
    public readonly status: CredentialStatus,
    public readonly walletAddress: string,
    public readonly isMock: boolean,
    public readonly xrplCredentialId: string | null,
    public readonly xrplNetwork: string | null,
    public readonly xrplIssuerAddress: string | null,
    public readonly xrplSubjectAddress: string | null,
    public readonly xrplCredentialType: string | null,
    public readonly xrplTxHash: string | null,
    public readonly xrplLedgerIndex: bigint | null,
    public readonly xrplEngineResult: string | null,
    public readonly xrplValidated: boolean | null,
    public readonly payloadHash: string | null,
    public readonly sourceDocumentRef: string | null,
    public readonly authEventId: string | null,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly revokedAt: Date | null,
    public readonly failureReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public revoke(authEventId: string | null): void {
    (this as any).status = CredentialStatus.REVOKED;
    (this as any).revokedAt = new Date();
    (this as any).authEventId = authEventId;
  }
}
