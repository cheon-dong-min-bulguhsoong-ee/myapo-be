import { Injectable } from '@nestjs/common';
import { CredentialQueueResult } from '../dto/credential-queue.result';
import { CredentialRequestDetailResult } from '../dto/credential-request-detail.result';
import { GetCredentialQueueCommand } from '../dto/get-credential-queue.command';
import { Issuer } from '../entity/issuer.entity';
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

  async findDetailByIdAndIssuer(
    id: bigint,
    issuer: Issuer,
  ): Promise<CredentialRequestDetailResult | null> {
    const row = await this.repository.findDetailByIdAndIssuer(id, issuer.code);
    if (row === null) {
      return null;
    }
    return new CredentialRequestDetailResult(
      row.request,
      row.holderUserId,
      row.holderXrplAddress,
      row.holderAlias,
      issuer.walletAddress,
    );
  }
}
