import { Injectable } from '@nestjs/common';
import { Credential as CredentialRow } from '@prisma/client';
import { Credential } from '../../domain/issuer/entity/credential.entity';
import { CredentialStatus } from '../../domain/issuer/enum/credential-status.enum';
import { MyDataCategory } from '../../domain/mydata/enum/mydata-category.enum';
import { CredentialRepository } from '../../domain/issuer/repository/credential.repository';
import { CreateCredentialCommand } from '../../domain/issuer/repository/command/create-credential.command';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCredentialRepository extends CredentialRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(command: CreateCredentialCommand): Promise<Credential> {
    const row = await this.prisma.credential.create({
      data: {
        userId: command.userId,
        snapshotId: command.snapshotId,
        category: command.category,
        xrplTxHash: command.xrplTxHash,
        dataHash: command.dataHash,
        metadataUri: command.metadataUri,
        issuedAt: command.issuedAt,
        expiresAt: command.expiresAt,
        status: command.status,
      },
    });
    return this.toEntity(row);
  }

  async findActiveByUserId(userId: bigint): Promise<Credential[]> {
    const rows = await this.prisma.credential.findMany({
      where: {
        userId,
        status: CredentialStatus.ACTIVE,
        isDelete: false,
      },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findActiveByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: {
        userId,
        category,
        status: CredentialStatus.ACTIVE,
        isDelete: false,
      },
    });
    return row === null ? null : this.toEntity(row);
  }

  async supersedeActive(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<number> {
    const result = await this.prisma.credential.updateMany({
      where: {
        userId,
        category,
        status: CredentialStatus.ACTIVE,
        isDelete: false,
      },
      data: { status: CredentialStatus.SUPERSEDED },
    });
    return result.count;
  }

  private toEntity(row: CredentialRow): Credential {
    return new Credential(
      row.id,
      row.userId,
      row.snapshotId,
      row.category as MyDataCategory,
      row.xrplTxHash,
      row.dataHash,
      row.metadataUri,
      row.issuedAt,
      row.expiresAt,
      row.status as CredentialStatus,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
