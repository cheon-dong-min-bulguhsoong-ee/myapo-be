import { ComplianceEvent } from '../entity/compliance-event.entity';
import { ComplianceAction } from '../enum/compliance-action.enum';
import { ComplianceReason } from '../enum/compliance-reason.enum';

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
