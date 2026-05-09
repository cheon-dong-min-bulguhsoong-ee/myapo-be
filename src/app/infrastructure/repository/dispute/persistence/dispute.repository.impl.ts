import { Injectable } from '@nestjs/common';
import { Dispute as DisputeRow, DisputeTimeline as TimelineRow } from '@prisma/client';
import { Dispute, TimelineEntry } from '../../../../domain/dispute/entity/dispute.entity';
import { DisputeStatus } from '../../../../domain/dispute/enum/dispute-status.enum';
import { DisputeType } from '../../../../domain/dispute/enum/dispute-type.enum';
import {
  CreateDisputeInput,
  CreateTimelineEntryInput,
  DisputeRepository,
} from '../../../../domain/dispute/repository/dispute.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DisputeRepositoryImpl extends DisputeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateDisputeInput): Promise<Dispute> {
    const row = await this.prisma.dispute.create({
      data: {
        id: input.id,
        status: input.status,
        type: input.type,
        requestId: input.requestId,
        requesterId: input.requesterId,
        slaDeadline: input.slaDeadline,
      },
    });
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Dispute | null> {
    const row = await this.prisma.dispute.findUnique({
      where: { id },
      include: { timeline: { orderBy: { createdAt: 'asc' } } },
    });
    return row ? this.toEntity(row, row.timeline) : null;
  }

  async listByRequesterId(requesterId: bigint): Promise<Dispute[]> {
    const rows = await this.prisma.dispute.findMany({
      where: { requesterId },
      include: { timeline: { orderBy: { createdAt: 'asc' } } },
    });
    return rows.map((row) => this.toEntity(row, row.timeline));
  }

  async listByOperatorId(operatorId: bigint): Promise<Dispute[]> {
    const rows = await this.prisma.dispute.findMany({
      where: { operatorId },
      include: { timeline: { orderBy: { createdAt: 'asc' } } },
    });
    return rows.map((row) => this.toEntity(row, row.timeline));
  }

  async listAllActive(): Promise<Dispute[]> {
    const rows = await this.prisma.dispute.findMany({
      where: {
        NOT: {
          status: { in: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED] },
        },
      },
      include: { timeline: { orderBy: { createdAt: 'asc' } } },
    });
    return rows.map((row) => this.toEntity(row, row.timeline));
  }

  async update(dispute: Dispute): Promise<void> {
    await this.prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: dispute.status,
        operatorId: dispute.operatorId,
        isSlaPaused: dispute.isSlaPaused,
      },
    });
  }

  async addTimelineEntry(input: CreateTimelineEntryInput): Promise<void> {
    await this.prisma.disputeTimeline.create({
      data: {
        disputeId: input.disputeId,
        status: input.status,
        note: input.note,
        operatorId: input.operatorId,
        isInternal: input.isInternal,
      },
    });
  }

  async getOperatorWorkloads(): Promise<{ operatorId: bigint; activeCount: number }[]> {
    const activeDisputes = await this.prisma.dispute.groupBy({
      by: ['operatorId'],
      where: {
        operatorId: { not: null },
        status: { in: [DisputeStatus.ASSIGNED, DisputeStatus.IN_REVIEW, DisputeStatus.INFO_REQUESTED] }
      },
      _count: {
        id: true
      }
    });

    return activeDisputes.map(d => ({
      operatorId: d.operatorId!,
      activeCount: d._count.id
    }));
  }

  private toEntity(row: DisputeRow, timeline: TimelineRow[] = []): Dispute {
    const dispute = new Dispute(
      row.id,
      row.status as DisputeStatus,
      row.type as DisputeType,
      row.requestId,
      row.requesterId,
      row.operatorId,
      row.slaDeadline,
      row.isSlaPaused,
      row.createdAt,
      row.updatedAt,
    );

    timeline.forEach((t) => {
      dispute.addTimelineEntry(
        new TimelineEntry(
          t.id.toString(),
          t.status as DisputeStatus,
          t.note,
          t.operatorId,
          t.isInternal,
          t.createdAt,
        ),
      );
    });

    return dispute;
  }
}
