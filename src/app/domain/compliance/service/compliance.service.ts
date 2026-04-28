import { Injectable } from '@nestjs/common';
import { ComplianceEvent } from '../entity/compliance-event.entity';
import { ComplianceReason } from '../enum/compliance-reason.enum';
import { ComplianceAction } from '../enum/compliance-action.enum';
import { ComplianceCheckResult } from '../dto/compliance-check.result';

@Injectable()
export class ComplianceService {
  buildNoActionResult(
    userId: bigint,
    xrplAddress: string,
    event: ComplianceEvent,
  ): ComplianceCheckResult {
    return new ComplianceCheckResult(
      userId,
      xrplAddress,
      ComplianceAction.NO_ACTION,
      null,
      null,
      null,
      event,
    );
  }

  buildFreezeResult(
    userId: bigint,
    xrplAddress: string,
    reason: ComplianceReason,
    txHash: string,
    resultCode: string,
    event: ComplianceEvent,
  ): ComplianceCheckResult {
    return new ComplianceCheckResult(
      userId,
      xrplAddress,
      ComplianceAction.FREEZE,
      reason,
      txHash,
      resultCode,
      event,
    );
  }

  buildFreezeFailedResult(
    userId: bigint,
    xrplAddress: string,
    reason: ComplianceReason,
    event: ComplianceEvent,
  ): ComplianceCheckResult {
    return new ComplianceCheckResult(
      userId,
      xrplAddress,
      ComplianceAction.NO_ACTION,
      reason,
      null,
      null,
      event,
    );
  }

  evaluateRiskReason(
    visaRawData: Record<string, unknown> | null,
    taxRawData: Record<string, unknown> | null,
  ): ComplianceReason | null {
    const visaReason = this.evaluateVisa(visaRawData);
    if (visaReason !== null) {
      return visaReason;
    }
    return this.evaluateTax(taxRawData);
  }

  private evaluateVisa(
    rawData: Record<string, unknown> | null,
  ): ComplianceReason | null {
    if (rawData === null) {
      return null;
    }
    const expiry = (rawData as { expiry_date?: string }).expiry_date;
    if (typeof expiry === 'string' && new Date(expiry) < new Date()) {
      return ComplianceReason.VISA_EXPIRED;
    }
    const status = (rawData as { status?: string }).status;
    if (typeof status === 'string' && status !== 'ACTIVE') {
      return ComplianceReason.VISA_REVOKED;
    }
    return null;
  }

  private evaluateTax(
    rawData: Record<string, unknown> | null,
  ): ComplianceReason | null {
    if (rawData === null) {
      return null;
    }
    const cleared = (rawData as { is_cleared?: boolean }).is_cleared;
    if (cleared === false) {
      return ComplianceReason.TAX_OVERDUE;
    }
    return null;
  }
}
