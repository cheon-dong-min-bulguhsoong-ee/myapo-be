import { XrplTransaction } from './xrpl-transaction.entity';
import { CreateXrplTransactionCommand } from './create-xrpl-transaction.command';

export abstract class XrplTransactionRepository {
  abstract create(command: CreateXrplTransactionCommand): Promise<XrplTransaction>;
  abstract findByHash(txHash: string): Promise<XrplTransaction | null>;
}
