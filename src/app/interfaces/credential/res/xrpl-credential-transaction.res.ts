import { ApiProperty } from '@nestjs/swagger';
import { XrplCredentialTransactionKind } from '../../../domain/credential/dto/xrpl-credential-evidence.result';
import { XrplCredentialTransactionPayloadResult } from '../../../domain/credential/dto/xrpl-credential-transaction-payload.result';

export class XrplCredentialTransactionRes {
  @ApiProperty({ enum: XrplCredentialTransactionKind })
  readonly transactionKind!: XrplCredentialTransactionKind;

  @ApiProperty()
  readonly network!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  readonly transaction!: Record<string, unknown>;

  static from(result: XrplCredentialTransactionPayloadResult): XrplCredentialTransactionRes {
    return {
      transactionKind: result.transactionKind,
      network: result.network,
      transaction: result.transaction,
    };
  }
}
