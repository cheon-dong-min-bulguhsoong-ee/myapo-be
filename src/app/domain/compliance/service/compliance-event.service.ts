import { Injectable } from '@nestjs/common';
import { ComplianceEvent } from '../entity/compliance-event.entity';
import { ComplianceEventRepository } from '../repository/compliance-event.repository';
import { ComplianceEventType } from '../enum/compliance-event-type.enum';
import { ComplianceReason } from '../enum/compliance-reason.enum';
import { ComplianceTrigger } from '../enum/compliance-trigger.enum';
import { CreateComplianceEventCommand } from '../dto/create-compliance-event.command';

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
