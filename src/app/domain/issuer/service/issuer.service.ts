import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../user/repository/user.repository';
import { UserNotFoundException } from '../../user/exception/user-not-found.exception';
import { UserNotActiveException } from '../../user/exception/user-not-active.exception';
import { User } from '../../user/entity/user.entity';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../../mydata/enum/mydata-category.enum';
import { MyDataSnapshot } from '../../mydata/entity/mydata-snapshot.entity';
import { MyDataSnapshotRepository } from '../../mydata/repository/mydata-snapshot.repository';
import { MyDataSnapshotMissingException } from '../../mydata/exception/mydata-snapshot-missing.exception';
import { XrplCredentialClient } from '../../xrpl/client/xrpl-credential.client';
import { IssueXrplCredentialCommand } from '../../xrpl/client/command/issue-xrpl-credential.command';
import { XrplTxType } from '../../xrpl/enum/xrpl-tx-type.enum';
import { XrplTransactionRepository } from '../../xrpl/repository/xrpl-transaction.repository';
import { CreateXrplTransactionCommand } from '../../xrpl/repository/command/create-xrpl-transaction.command';
import { Credential } from '../entity/credential.entity';
import { CredentialStatus } from '../enum/credential-status.enum';
import { CredentialRepository } from '../repository/credential.repository';
import { CreateCredentialCommand } from '../repository/command/create-credential.command';
import { IssuanceBundleResult } from '../result/issuance-bundle.result';
import { IssuanceResultItem } from '../result/issuance-result-item';

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

@Injectable()
export class IssuerService {
  private readonly logger = new Logger(IssuerService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly snapshotRepository: MyDataSnapshotRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly xrplClient: XrplCredentialClient,
    private readonly xrplTxRepository: XrplTransactionRepository,
  ) {}

  async issueBundle(xrplAddress: string): Promise<IssuanceBundleResult> {
    const user = await this.loadActiveUser(xrplAddress);
    const snapshotMap = await this.snapshotRepository.findLatestByUserId(user.id);
    this.assertAtLeastOneSnapshot(user.id, snapshotMap);

    const items: IssuanceResultItem[] = [];
    for (const category of MYDATA_CATEGORIES) {
      const item = await this.issueOneCategory(user, category, snapshotMap);
      items.push(item);
    }
    return new IssuanceBundleResult(user.id, user.xrplAddress, items);
  }

  private async loadActiveUser(xrplAddress: string): Promise<User> {
    const user = await this.userRepository.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new UserNotFoundException(xrplAddress);
    }
    if (!user.isActive()) {
      throw new UserNotActiveException(user.id, user.status);
    }
    return user;
  }

  private assertAtLeastOneSnapshot(
    userId: bigint,
    snapshotMap: Map<MyDataCategory, MyDataSnapshot>,
  ): void {
    const missing: MyDataCategory[] = [];
    for (const category of MYDATA_CATEGORIES) {
      if (!snapshotMap.has(category)) {
        missing.push(category);
      }
    }
    if (missing.length === MYDATA_CATEGORIES.length) {
      throw new MyDataSnapshotMissingException(userId, missing);
    }
  }

  private async issueOneCategory(
    user: User,
    category: MyDataCategory,
    snapshotMap: Map<MyDataCategory, MyDataSnapshot>,
  ): Promise<IssuanceResultItem> {
    const snapshot = snapshotMap.get(category);
    if (snapshot === undefined) {
      return IssuanceResultItem.skipped(category, 'snapshot missing');
    }
    try {
      const credential = await this.persistCredential(user, snapshot);
      return IssuanceResultItem.issued(
        category,
        credential.xrplTxHash,
        'tesSUCCESS',
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`issue ${category} failed: ${reason}`);
      return IssuanceResultItem.failed(category, reason);
    }
  }

  private async persistCredential(
    user: User,
    snapshot: MyDataSnapshot,
  ): Promise<Credential> {
    const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
    const metadataUri = `ipfs://placeholder/${snapshot.category}/${snapshot.dataHash}`;

    const issueCommand = new IssueXrplCredentialCommand(
      user.xrplAddress,
      snapshot.category,
      snapshot.dataHash,
      metadataUri,
      expiresAt,
    );
    const txResult = await this.xrplClient.issueCredential(issueCommand);

    const ledgerIndex =
      txResult.ledgerIndex === null ? null : BigInt(txResult.ledgerIndex);
    await this.xrplTxRepository.create(
      new CreateXrplTransactionCommand(
        user.id,
        txResult.txHash,
        XrplTxType.CREDENTIAL_CREATE,
        user.xrplAddress,
        txResult.resultCode,
        txResult.rawResponse,
        user.xrplAddress,
        txResult.feeDrops,
        ledgerIndex,
      ),
    );

    await this.credentialRepository.supersedeActive(user.id, snapshot.category);
    return this.credentialRepository.create(
      new CreateCredentialCommand(
        user.id,
        snapshot.id,
        snapshot.category,
        txResult.txHash,
        snapshot.dataHash,
        metadataUri,
        new Date(),
        expiresAt,
        CredentialStatus.ACTIVE,
      ),
    );
  }
}
