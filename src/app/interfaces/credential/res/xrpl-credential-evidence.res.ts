import { ApiProperty } from '@nestjs/swagger';
import { XrplCredentialTransactionEvidenceResult, XrplCredentialTransactionKind } from '../../../domain/credential/dto/xrpl-credential-evidence.result';

export class XrplCredentialEvidenceRes {
  @ApiProperty({ enum: XrplCredentialTransactionKind })
  readonly transactionKind!: XrplCredentialTransactionKind;

  @ApiProperty()
  readonly network!: string;

  @ApiProperty()
  readonly transactionHash!: string;

  @ApiProperty()
  readonly engineResult!: string;

  @ApiProperty({ nullable: true })
  readonly ledgerIndex!: string | null;

  @ApiProperty()
  readonly validated!: boolean;

  @ApiProperty({ nullable: true })
  readonly feeDrops!: string | null;

  @ApiProperty()
  readonly account!: string;

  @ApiProperty({ nullable: true })
  readonly issuer!: string | null;

  @ApiProperty({ nullable: true })
  readonly subject!: string | null;

  @ApiProperty()
  readonly credentialType!: string;

  @ApiProperty({ nullable: true })
  readonly flags!: number | null;

  @ApiProperty({ nullable: true })
  readonly objectSnapshot!: Record<string, unknown> | null;

  static from(result: XrplCredentialTransactionEvidenceResult): XrplCredentialEvidenceRes {
    return {
      transactionKind: result.transactionKind,
      network: result.network,
      transactionHash: result.transactionHash,
      engineResult: result.engineResult,
      ledgerIndex: result.ledgerIndex?.toString() ?? null,
      validated: result.validated,
      feeDrops: result.feeDrops,
      account: result.account,
      issuer: result.issuer,
      subject: result.subject,
      credentialType: result.credentialType,
      flags: result.flags,
      objectSnapshot: result.objectSnapshot,
    };
  }
}
