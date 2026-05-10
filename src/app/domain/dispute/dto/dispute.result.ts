import { DisputeStatus } from "../enum/dispute-status.enum";
import { DisputeType } from "../enum/dispute-type.enum";

export class TimelineEntryResult {
  constructor(
    public readonly id: string,
    public readonly status: DisputeStatus,
    public readonly note: string | null,
    public readonly operatorId: string | null,
    public readonly isInternal: boolean,
    public readonly createdAt: Date,
  ) {}
}

export class DisputeResult {
  constructor(
    public readonly id: string,
    public readonly status: DisputeStatus,
    public readonly type: DisputeType,
    public readonly requestId: string,
    public readonly requesterId: string,
    public readonly operatorId: string | null,
    public readonly slaDeadline: Date,
    public readonly isSlaPaused: boolean,
    public readonly timeline: TimelineEntryResult[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class DisputeSummaryResult {
  constructor(
    public readonly id: string,
    public readonly status: DisputeStatus,
    public readonly type: DisputeType,
    public readonly requestId: string,
    public readonly operatorId: string | null,
    public readonly slaDeadline: Date,
    public readonly createdAt: Date,
  ) {}
}
