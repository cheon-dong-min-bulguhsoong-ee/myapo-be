import { Injectable } from '@nestjs/common';
import { AdmissionLog as AdmissionLogRow } from '@prisma/client';
import { AdmissionLog } from '../../../../domain/gateway/admission-log.entity';
import { AdmissionResult } from '../../../../domain/gateway/admission-result.enum';
import { AdmissionLogRepository } from '../../../../domain/gateway/admission-log.repository';
import { CreateAdmissionLogCommand } from '../../../../domain/gateway/create-admission-log.command';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdmissionLogRepositoryImpl extends AdmissionLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(command: CreateAdmissionLogCommand): Promise<AdmissionLog> {
    const row = await this.prisma.admissionLog.create({
      data: {
        userId: command.userId,
        domainId: command.domainId,
        result: command.result,
        missing: command.missing,
        requester: command.requester,
      },
    });
    return this.toEntity(row);
  }

  async findRecentByUserId(
    userId: bigint,
    limit: number,
  ): Promise<AdmissionLog[]> {
    const rows = await this.prisma.admissionLog.findMany({
      where: { userId, isDelete: false },
      orderBy: { requestedAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: AdmissionLogRow): AdmissionLog {
    return new AdmissionLog(
      row.id,
      row.userId,
      row.domainId,
      row.result as AdmissionResult,
      row.missing,
      row.requester,
      row.requestedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
