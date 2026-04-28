import { Injectable } from '@nestjs/common';
import { CreateXrplTransactionCommand } from './create-xrpl-transaction.command';
import { XrplCredentialIssueResult } from './xrpl-credential-issue.result';
import { XrplFreezeResult } from './xrpl-freeze.result';
import { XrplTransaction } from './xrpl-transaction.entity';
import { XrplTransactionRepository } from './xrpl-transaction.repository';
import { XrplTxType } from './xrpl-tx-type.enum';

@Injectable()
export class XrplTransactionService {
  constructor(private readonly xrplTxRepository: XrplTransactionRepository) {}

  recordCredentialCreate(
    userId: bigint,
    account: string,
    subject: string,
    txResult: XrplCredentialIssueResult,
  ): Promise<XrplTransaction> {
    const ledgerIndex =
      txResult.ledgerIndex === null ? null : BigInt(txResult.ledgerIndex);
    return this.xrplTxRepository.create(
      new CreateXrplTransactionCommand(
        userId,
        txResult.txHash,
        XrplTxType.CREDENTIAL_CREATE,
        account,
        txResult.resultCode,
        txResult.rawResponse,
        subject,
        txResult.feeDrops,
        ledgerIndex,
      ),
    );
  }

  recordTrustSet(
    userId: bigint,
    account: string,
    subject: string,
    txResult: XrplFreezeResult,
  ): Promise<XrplTransaction> {
    return this.xrplTxRepository.create(
      new CreateXrplTransactionCommand(
        userId,
        txResult.txHash,
        XrplTxType.TRUST_SET,
        account,
        txResult.resultCode,
        txResult.rawResponse,
        subject,
      ),
    );
  }
}
