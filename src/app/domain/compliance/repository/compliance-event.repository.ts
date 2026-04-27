import { ComplianceEvent } from '../entity/compliance-event.entity';
import { CreateComplianceEventCommand } from './command/create-compliance-event.command';

export abstract class ComplianceEventRepository {
  abstract create(command: CreateComplianceEventCommand): Promise<ComplianceEvent>;
  abstract findRecentByUserId(
    userId: bigint,
    limit: number,
  ): Promise<ComplianceEvent[]>;
}
