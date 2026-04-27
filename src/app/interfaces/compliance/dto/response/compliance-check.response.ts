import { ApiProperty } from '@nestjs/swagger';
import { ComplianceCheckResult } from '../../../../domain/compliance/result/compliance-check.result';
import { ComplianceAction } from '../../../../domain/compliance/enum/compliance-action.enum';
import { ComplianceReason } from '../../../../domain/compliance/enum/compliance-reason.enum';

export class ComplianceCheckResponse {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ enum: ComplianceAction, enumName: 'ComplianceAction' })
  public readonly action: ComplianceAction;

  @ApiProperty({ enum: ComplianceReason, enumName: 'ComplianceReason', nullable: true })
  public readonly reason: ComplianceReason | null;

  @ApiProperty({ nullable: true, example: 'ABC123DEF456' })
  public readonly txHash: string | null;

  @ApiProperty({ nullable: true, example: 'tesSUCCESS' })
  public readonly resultCode: string | null;

  constructor(
    xrplAddress: string,
    action: ComplianceAction,
    reason: ComplianceReason | null,
    txHash: string | null,
    resultCode: string | null,
  ) {
    this.xrplAddress = xrplAddress;
    this.action = action;
    this.reason = reason;
    this.txHash = txHash;
    this.resultCode = resultCode;
  }

  static from(result: ComplianceCheckResult): ComplianceCheckResponse {
    return new ComplianceCheckResponse(
      result.xrplAddress,
      result.action,
      result.reason,
      result.txHash,
      result.resultCode,
    );
  }
}
