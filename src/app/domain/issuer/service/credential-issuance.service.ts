import { Injectable } from '@nestjs/common';
import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { Credential } from '../entity/credential.entity';
import { CredentialStatus } from '../enum/credential-status.enum';
import { CreateCredentialCommand } from '../dto/create-credential.command';
import { CredentialService } from './credential.service';

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export interface RecordIssuedCredentialCommand {
  readonly userId: bigint;
  readonly snapshotId: bigint;
  readonly category: MyDataCategory;
  readonly dataHash: string;
  readonly xrplTxHash: string;
  readonly metadataUri: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
}

@Injectable()
export class CredentialIssuanceService {
  constructor(private readonly credentialService: CredentialService) {}

  createDefaultExpiresAt(now: Date = new Date()): Date {
    return new Date(now.getTime() + ONE_YEAR_MS);
  }

  createMetadataUri(category: MyDataCategory, dataHash: string): string {
    return `ipfs://placeholder/${category}/${dataHash}`;
  }

  async recordIssued(
    command: RecordIssuedCredentialCommand,
  ): Promise<Credential> {
    await this.credentialService.supersedeActive(
      command.userId,
      command.category,
    );
    return this.credentialService.create(
      new CreateCredentialCommand(
        command.userId,
        command.snapshotId,
        command.category,
        command.xrplTxHash,
        command.dataHash,
        command.metadataUri,
        command.issuedAt,
        command.expiresAt,
        CredentialStatus.ACTIVE,
      ),
    );
  }
}
