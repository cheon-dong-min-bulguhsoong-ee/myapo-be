import { CredentialRequestStatus } from '../enum/credential-request-status.enum';
import { IssuerCode } from '../enum/issuer-code.enum';

export class GetCredentialQueueCommand {
  constructor(
    public readonly issuerCode: IssuerCode,
    public readonly status: CredentialRequestStatus | null,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
