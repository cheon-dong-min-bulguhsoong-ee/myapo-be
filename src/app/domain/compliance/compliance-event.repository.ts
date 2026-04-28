import { ComplianceEvent } from './compliance-event.entity';
import { CreateComplianceEventCommand } from './create-compliance-event.command';

export abstract class ComplianceEventRepository {
  abstract create(command: CreateComplianceEventCommand): Promise<ComplianceEvent>;
  abstract findRecentByUserId(
    userId: bigint,
    limit: number,
  ): Promise<ComplianceEvent[]>;
}
