import { ComplianceEvent } from './compliance-event.entity';
import { ComplianceAction } from './compliance-action.enum';
import { ComplianceReason } from './compliance-reason.enum';

export class ComplianceCheckResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly action: ComplianceAction,
    public readonly reason: ComplianceReason | null,
    public readonly txHash: string | null,
    public readonly resultCode: string | null,
    public readonly event: ComplianceEvent,
  ) {}
}
