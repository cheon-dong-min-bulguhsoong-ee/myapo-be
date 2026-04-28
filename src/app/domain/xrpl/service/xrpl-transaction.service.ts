import { Injectable } from '@nestjs/common';
import { CreateXrplTransactionCommand } from '../dto/create-xrpl-transaction.command';
import { XrplCredentialIssueResult } from '../dto/xrpl-credential-issue.result';
import { XrplFreezeResult } from '../dto/xrpl-freeze.result';
import { XrplTransaction } from '../entity/xrpl-transaction.entity';
import { XrplTransactionRepository } from '../repository/xrpl-transaction.repository';
import { XrplTxType } from '../enum/xrpl-tx-type.enum';

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
