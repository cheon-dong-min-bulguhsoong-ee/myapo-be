import { Injectable } from '@nestjs/common';
import { ComplianceEvent as ComplianceEventRow, Prisma } from '@prisma/client';
import { ComplianceEvent } from '../../domain/compliance/entity/compliance-event.entity';
import { ComplianceEventType } from '../../domain/compliance/enum/compliance-event-type.enum';
import { ComplianceReason } from '../../domain/compliance/enum/compliance-reason.enum';
import { ComplianceTrigger } from '../../domain/compliance/enum/compliance-trigger.enum';
import { ComplianceEventRepository } from '../../domain/compliance/repository/compliance-event.repository';
import { CreateComplianceEventCommand } from '../../domain/compliance/repository/command/create-compliance-event.command';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaComplianceEventRepository extends ComplianceEventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(command: CreateComplianceEventCommand): Promise<ComplianceEvent> {
    const row = await this.prisma.complianceEvent.create({
      data: {
        userId: command.userId,
        eventType: command.eventType,
        reason: command.reason,
        triggeredBy: command.triggeredBy,
        xrplTxHash: command.xrplTxHash,
        detail:
          command.detail === null
            ? Prisma.JsonNull
            : (command.detail as Prisma.InputJsonValue),
      },
    });
    return this.toEntity(row);
  }

  async findRecentByUserId(
    userId: bigint,
    limit: number,
  ): Promise<ComplianceEvent[]> {
    const rows = await this.prisma.complianceEvent.findMany({
      where: { userId, isDelete: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: ComplianceEventRow): ComplianceEvent {
    return new ComplianceEvent(
      row.id,
      row.userId,
      row.eventType as ComplianceEventType,
      row.reason === null ? null : (row.reason as ComplianceReason),
      row.triggeredBy as ComplianceTrigger,
      row.xrplTxHash,
      row.detail === null ? null : (row.detail as Record<string, unknown>),
      row.createdAt,
      row.updatedAt,
    );
  }
}
