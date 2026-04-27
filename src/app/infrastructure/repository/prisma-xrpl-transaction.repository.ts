import { Injectable } from '@nestjs/common';
import { XrplTransaction as XrplTransactionRow, Prisma } from '@prisma/client';
import { XrplTransaction } from '../../domain/xrpl/entity/xrpl-transaction.entity';
import { XrplTxType } from '../../domain/xrpl/enum/xrpl-tx-type.enum';
import { XrplTransactionRepository } from '../../domain/xrpl/repository/xrpl-transaction.repository';
import { CreateXrplTransactionCommand } from '../../domain/xrpl/repository/command/create-xrpl-transaction.command';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaXrplTransactionRepository extends XrplTransactionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(command: CreateXrplTransactionCommand): Promise<XrplTransaction> {
    const row = await this.prisma.xrplTransaction.create({
      data: {
        userId: command.userId,
        txHash: command.txHash,
        txType: command.txType,
        account: command.account,
        subject: command.subject,
        resultCode: command.resultCode,
        feeDrops: command.feeDrops,
        ledgerIndex: command.ledgerIndex,
        rawResponse: command.rawResponse as Prisma.InputJsonValue,
        submittedAt: command.submittedAt ?? new Date(),
      },
    });
    return this.toEntity(row);
  }

  async findByHash(txHash: string): Promise<XrplTransaction | null> {
    const row = await this.prisma.xrplTransaction.findUnique({
      where: { txHash },
    });
    return row === null ? null : this.toEntity(row);
  }

  private toEntity(row: XrplTransactionRow): XrplTransaction {
    return new XrplTransaction(
      row.id,
      row.userId,
      row.txHash,
      row.txType as XrplTxType,
      row.account,
      row.subject,
      row.resultCode,
      row.feeDrops,
      row.ledgerIndex,
      row.rawResponse as Record<string, unknown>,
      row.submittedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
