import { Injectable } from '@nestjs/common';
import {
  CredentialRequest as CredentialRequestRow,
  Prisma,
} from '@prisma/client';
import { MyDataCategory } from '../../../../domain/common/enum/mydata-category.enum';
import { CredentialRequest } from '../../../../domain/issuer/entity/credential-request.entity';
import { CredentialRequestStatus } from '../../../../domain/issuer/enum/credential-request-status.enum';
import { IssuerCode } from '../../../../domain/issuer/enum/issuer-code.enum';
import {
  CredentialQueueFilter,
  CredentialQueueRow,
  CredentialQueueStats,
  CredentialRequestRepository,
} from '../../../../domain/issuer/repository/credential-request.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CredentialRequestRepositoryImpl extends CredentialRequestRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findQueue(filter: CredentialQueueFilter): Promise<{
    rows: CredentialQueueRow[];
    total: number;
  }> {
    const where: Prisma.CredentialRequestWhereInput = {
      issuerCode: filter.issuerCode,
      isDelete: false,
    };
    if (filter.status !== null) {
      where.status = filter.status;
    }

    const skip = (filter.page - 1) * filter.limit;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.credentialRequest.findMany({
        where,
        include: { user: { select: { xrplAddress: true } } },
        orderBy: { id: 'desc' },
        skip,
        take: filter.limit,
      }),
      this.prisma.credentialRequest.count({ where }),
    ]);

    return {
      rows: rows.map(
        (row) =>
          new CredentialQueueRow(this.toEntity(row), row.user.xrplAddress),
      ),
      total,
    };
  }

  async collectStats(issuerCode: IssuerCode): Promise<CredentialQueueStats> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [pending, completed, failed24h, revoked] =
      await this.prisma.$transaction([
        this.prisma.credentialRequest.count({
          where: {
            issuerCode,
            status: CredentialRequestStatus.PENDING,
            isDelete: false,
          },
        }),
        this.prisma.credentialRequest.count({
          where: {
            issuerCode,
            status: CredentialRequestStatus.COMPLETED,
            isDelete: false,
          },
        }),
        this.prisma.credentialRequest.count({
          where: {
            issuerCode,
            status: CredentialRequestStatus.FAILED,
            isDelete: false,
            requestedAt: { gte: since24h },
          },
        }),
        this.prisma.credentialRequest.count({
          where: {
            issuerCode,
            status: CredentialRequestStatus.REVOKED,
            isDelete: false,
          },
        }),
      ]);
    return { pending, completed, failed24h, revoked };
  }

  private toEntity(row: CredentialRequestRow): CredentialRequest {
    return new CredentialRequest(
      row.id,
      row.bundleId,
      row.userId,
      row.issuerCode as IssuerCode,
      row.category as MyDataCategory,
      row.status as CredentialRequestStatus,
      row.failureReason,
      row.xrplTxHash,
      row.requestedAt,
      row.processedAt,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
