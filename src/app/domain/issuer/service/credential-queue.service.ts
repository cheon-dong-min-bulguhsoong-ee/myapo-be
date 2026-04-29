import { Injectable } from '@nestjs/common';
import { CredentialQueueResult } from '../dto/credential-queue.result';
import { GetCredentialQueueCommand } from '../dto/get-credential-queue.command';
import { CredentialRequestRepository } from '../repository/credential-request.repository';

@Injectable()
export class CredentialQueueService {
  constructor(private readonly repository: CredentialRequestRepository) {}

  async getQueue(
    command: GetCredentialQueueCommand,
  ): Promise<CredentialQueueResult> {
    const [stats, page] = await Promise.all([
      this.repository.collectStats(command.issuerCode),
      this.repository.findQueue({
        issuerCode: command.issuerCode,
        status: command.status,
        page: command.page,
        limit: command.limit,
      }),
    ]);
    return new CredentialQueueResult(
      stats,
      page.rows,
      command.page,
      command.limit,
      page.total,
    );
  }
}
