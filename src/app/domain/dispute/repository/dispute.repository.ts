import { Dispute } from "../entity/dispute.entity";
import { DisputeStatus } from "../enum/dispute-status.enum";
import { DisputeType } from "../enum/dispute-type.enum";

export interface CreateDisputeInput {
  id: string;
  type: DisputeType;
  requestId: string;
  requesterId: bigint;
  status: DisputeStatus;
  slaDeadline: Date;
}

export interface CreateTimelineEntryInput {
  disputeId: string;
  status: DisputeStatus;
  note: string | null;
  operatorId: bigint | null;
  isInternal: boolean;
}

export abstract class DisputeRepository {
  abstract create(input: CreateDisputeInput): Promise<Dispute>;
  abstract findById(id: string): Promise<Dispute | null>;
  abstract listByRequesterId(requesterId: bigint): Promise<Dispute[]>;
  abstract listByOperatorId(operatorId: bigint): Promise<Dispute[]>;
  abstract listAllActive(): Promise<Dispute[]>;
  abstract update(dispute: Dispute): Promise<void>;
  abstract addTimelineEntry(input: CreateTimelineEntryInput): Promise<void>;

  /**
   * 운영자들의 현재 활성 배정 건수를 조회한다 (최소 부하 배정 로직용).
   */
  abstract getOperatorWorkloads(): Promise<
    { operatorId: bigint; activeCount: number }[]
  >;
}
