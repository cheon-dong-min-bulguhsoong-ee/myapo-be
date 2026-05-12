import { ApiProperty } from "@nestjs/swagger";
import {
  DisputeResult,
  DisputeSummaryResult,
  TimelineEntryResult,
} from "../../../domain/dispute/dto/dispute.result";

export class TimelineEntryRes {
  @ApiProperty()
  readonly id!: string;
  @ApiProperty()
  readonly status!: string;
  @ApiProperty({ required: false })
  readonly note!: string | null;
  @ApiProperty({ required: false })
  readonly operatorId!: string | null;
  @ApiProperty()
  readonly isInternal!: boolean;
  @ApiProperty()
  readonly createdAt!: string;

  static from(result: TimelineEntryResult): TimelineEntryRes {
    return {
      id: result.id,
      status: result.status,
      note: result.note,
      operatorId: result.operatorId,
      isInternal: result.isInternal,
      createdAt: result.createdAt.toISOString(),
    };
  }
}

export class DisputeRes {
  @ApiProperty()
  readonly id!: string;
  @ApiProperty()
  readonly status!: string;
  @ApiProperty()
  readonly type!: string;
  @ApiProperty()
  readonly targetStage!: string;
  @ApiProperty()
  readonly requestId!: string;
  @ApiProperty()
  readonly requesterId!: string;
  @ApiProperty({ required: false })
  readonly operatorId!: string | null;
  @ApiProperty()
  readonly slaDeadline!: string;
  @ApiProperty()
  readonly isSlaPaused!: boolean;
  @ApiProperty({ type: [TimelineEntryRes] })
  readonly timeline!: TimelineEntryRes[];
  @ApiProperty()
  readonly createdAt!: string;

  static from(result: DisputeResult): DisputeRes {
    return {
      id: result.id,
      status: result.status,
      type: result.type,
      targetStage: result.targetStage,
      requestId: result.requestId,
      requesterId: result.requesterId,
      operatorId: result.operatorId,
      slaDeadline: result.slaDeadline.toISOString(),
      isSlaPaused: result.isSlaPaused,
      timeline: result.timeline.map((t) => TimelineEntryRes.from(t)),
      createdAt: result.createdAt.toISOString(),
    };
  }
}

export class DisputeSummaryRes {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly status!: string;

  @ApiProperty()
  readonly type!: string;

  @ApiProperty()
  readonly targetStage!: string;

  @ApiProperty()
  readonly requestId!: string;

  @ApiProperty({ required: false })
  readonly operatorId!: string | null;

  @ApiProperty()
  readonly slaDeadline!: string;

  @ApiProperty()
  readonly createdAt!: string;

  static from(result: DisputeSummaryResult): DisputeSummaryRes {
    return {
      id: result.id,
      status: result.status,
      type: result.type,
      targetStage: result.targetStage,
      requestId: result.requestId,
      operatorId: result.operatorId,
      slaDeadline: result.slaDeadline.toISOString(),
      createdAt: result.createdAt.toISOString(),
    };
  }
}

export class ListDisputesRes {
  @ApiProperty({ type: [DisputeSummaryRes] })
  readonly disputes!: DisputeSummaryRes[];

  static from(results: DisputeSummaryResult[]): ListDisputesRes {
    return { disputes: results.map(DisputeSummaryRes.from) };
  }
}
