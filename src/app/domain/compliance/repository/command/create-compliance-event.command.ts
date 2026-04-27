import { ComplianceEventType } from '../../enum/compliance-event-type.enum';
import { ComplianceReason } from '../../enum/compliance-reason.enum';
import { ComplianceTrigger } from '../../enum/compliance-trigger.enum';

export class CreateComplianceEventCommand {
  constructor(
    public readonly userId: bigint,
    public readonly eventType: ComplianceEventType,
    public readonly triggeredBy: ComplianceTrigger,
    public readonly reason: ComplianceReason | null = null,
    public readonly xrplTxHash: string | null = null,
    public readonly detail: Record<string, unknown> | null = null,
  ) {}
}
