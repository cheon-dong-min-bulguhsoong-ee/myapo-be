import { Injectable } from '@nestjs/common';
import {
  CredentialBundle as CredentialBundleRow,
  CredentialRequest as CredentialRequestRow,
} from '@prisma/client';
import { MyDataCategory } from '../../../../domain/common/enum/mydata-category.enum';
import { CredentialBundle } from '../../../../domain/issuer/entity/credential-bundle.entity';
import { CredentialRequest } from '../../../../domain/issuer/entity/credential-request.entity';
import { CredentialBundleStatus } from '../../../../domain/issuer/enum/credential-bundle-status.enum';
import { CredentialRequestStatus } from '../../../../domain/issuer/enum/credential-request-status.enum';
import { IssuerCode } from '../../../../domain/issuer/enum/issuer-code.enum';
import {
  CreateCredentialRequestRow,
  CredentialBundleRepository,
} from '../../../../domain/issuer/repository/credential-bundle.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CredentialBundleRepositoryImpl extends CredentialBundleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createWithRequests(
    bundleCode: string,
    userId: bigint,
    rows: CreateCredentialRequestRow[],
  ): Promise<{ bundle: CredentialBundle; requests: CredentialRequest[] }> {
    return this.prisma.$transaction(async (tx) => {
      const bundleRow = await tx.credentialBundle.create({
        data: {
          bundleCode,
          userId,
          totalCount: rows.length,
        },
      });

      const requestRows = await Promise.all(
        rows.map((row) =>
          tx.credentialRequest.create({
            data: {
              bundleId: bundleRow.id,
              userId,
              issuerCode: row.issuerCode,
              category: row.category,
            },
          }),
        ),
      );

      return {
        bundle: this.toBundleEntity(bundleRow),
        requests: requestRows.map((row) => this.toRequestEntity(row)),
      };
    });
  }

  private toBundleEntity(row: CredentialBundleRow): CredentialBundle {
    return new CredentialBundle(
      row.id,
      row.bundleCode,
      row.userId,
      row.status as CredentialBundleStatus,
      row.totalCount,
      row.completedCount,
      row.failedCount,
      row.requestedAt,
      row.completedAt,
      row.expiresAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  private toRequestEntity(row: CredentialRequestRow): CredentialRequest {
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
