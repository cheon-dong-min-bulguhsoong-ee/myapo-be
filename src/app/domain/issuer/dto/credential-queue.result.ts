import {
  CredentialQueueRow,
  CredentialQueueStats,
} from '../repository/credential-request.repository';

export class CredentialQueueResult {
  constructor(
    public readonly stats: CredentialQueueStats,
    public readonly rows: CredentialQueueRow[],
    public readonly page: number,
    public readonly limit: number,
    public readonly total: number,
  ) {}
}
