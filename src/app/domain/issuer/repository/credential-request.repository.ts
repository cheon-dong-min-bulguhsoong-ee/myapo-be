import { CredentialRequest } from '../entity/credential-request.entity';
import { CredentialRequestStatus } from '../enum/credential-request-status.enum';
import { IssuerCode } from '../enum/issuer-code.enum';

export interface CredentialQueueFilter {
  issuerCode: IssuerCode;
  status: CredentialRequestStatus | null;
  page: number;
  limit: number;
}

export class CredentialQueueRow {
  constructor(
    public readonly request: CredentialRequest,
    public readonly holderWallet: string,
  ) {}
}

export interface CredentialQueueStats {
  pending: number;
  completed: number;
  failed24h: number;
  revoked: number;
}

export abstract class CredentialRequestRepository {
  abstract findQueue(filter: CredentialQueueFilter): Promise<{
    rows: CredentialQueueRow[];
    total: number;
  }>;

  abstract collectStats(issuerCode: IssuerCode): Promise<CredentialQueueStats>;
}
