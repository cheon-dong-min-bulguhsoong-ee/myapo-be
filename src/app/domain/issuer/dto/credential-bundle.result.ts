import { CredentialBundle } from '../entity/credential-bundle.entity';
import { CredentialRequest } from '../entity/credential-request.entity';

export class CredentialBundleResult {
  constructor(
    public readonly bundle: CredentialBundle,
    public readonly requests: CredentialRequest[],
  ) {}
}
