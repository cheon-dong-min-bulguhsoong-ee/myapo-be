import { CredentialRequest } from '../entity/credential-request.entity';

export class CredentialRequestDetailResult {
  constructor(
    public readonly request: CredentialRequest,
    public readonly holderUserId: bigint,
    public readonly holderXrplAddress: string,
    public readonly holderAlias: string | null,
    public readonly issuerWallet: string | null,
  ) {}
}
