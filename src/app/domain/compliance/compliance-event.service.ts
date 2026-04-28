import { Injectable } from '@nestjs/common';
import { ComplianceEvent } from './compliance-event.entity';
import { ComplianceEventRepository } from './compliance-event.repository';
import { ComplianceEventType } from './compliance-event-type.enum';
import { ComplianceReason } from './compliance-reason.enum';
import { ComplianceTrigger } from './compliance-trigger.enum';
import { CreateComplianceEventCommand } from './create-compliance-event.command';

@Injectable()
export class ComplianceEventService {
  constructor(private readonly eventRepository: ComplianceEventRepository) {}

  recordNoAction(
    userId: bigint,
    xrplAddress: string,
    triggeredBy: ComplianceTrigger,
  ): Promise<ComplianceEvent> {
    return this.eventRepository.create(
      new CreateComplianceEventCommand(
        userId,
        ComplianceEventType.CHECK_NO_ACTION,
        triggeredBy,
        null,
        null,
        { xrplAddress },
      ),
    );
  }

  recordFreeze(
    userId: bigint,
    xrplAddress: string,
    triggeredBy: ComplianceTrigger,
    reason: ComplianceReason,
    txHash: string,
  ): Promise<ComplianceEvent> {
    return this.eventRepository.create(
      new CreateComplianceEventCommand(
        userId,
        ComplianceEventType.FREEZE,
        triggeredBy,
        reason,
        txHash,
        { xrplAddress },
      ),
    );
  }

  recordCheckFailed(
    userId: bigint,
    triggeredBy: ComplianceTrigger,
    reason: ComplianceReason,
    detail: string,
  ): Promise<ComplianceEvent> {
    return this.eventRepository.create(
      new CreateComplianceEventCommand(
        userId,
        ComplianceEventType.CHECK_FAILED,
        triggeredBy,
        reason,
        null,
        { error: detail },
      ),
    );
  }
}
