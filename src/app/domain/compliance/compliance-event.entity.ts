import { ComplianceEventType } from './compliance-event-type.enum';
import { ComplianceReason } from './compliance-reason.enum';
import { ComplianceTrigger } from './compliance-trigger.enum';

export class ComplianceEvent {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint,
    public readonly eventType: ComplianceEventType,
    public readonly reason: ComplianceReason | null,
    public readonly triggeredBy: ComplianceTrigger,
    public readonly xrplTxHash: string | null,
    public readonly detail: Record<string, unknown> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
