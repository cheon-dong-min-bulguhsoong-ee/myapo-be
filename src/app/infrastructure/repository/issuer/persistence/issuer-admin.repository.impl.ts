import { Injectable } from '@nestjs/common';
import { IssuerAdmin as IssuerAdminRow } from '@prisma/client';
import { IssuerAdmin } from '../../../../domain/issuer/entity/issuer-admin.entity';
import { IssuerCode } from '../../../../domain/issuer/enum/issuer-code.enum';
import { IssuerAdminRepository } from '../../../../domain/issuer/repository/issuer-admin.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class IssuerAdminRepositoryImpl extends IssuerAdminRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByIssuerAndAdminId(
    issuerCode: IssuerCode,
    adminId: string,
  ): Promise<IssuerAdmin | null> {
    const row = await this.prisma.issuerAdmin.findFirst({
      where: { issuerCode, adminId, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async create(input: {
    issuerCode: IssuerCode;
    adminId: string;
    passwordHash: string;
  }): Promise<IssuerAdmin> {
    const row = await this.prisma.issuerAdmin.create({
      data: {
        issuerCode: input.issuerCode,
        adminId: input.adminId,
        passwordHash: input.passwordHash,
      },
    });
    return this.toEntity(row);
  }

  private toEntity(row: IssuerAdminRow): IssuerAdmin {
    return new IssuerAdmin(
      row.id,
      row.issuerCode as IssuerCode,
      row.adminId,
      row.passwordHash,
      row.status,
      row.createdAt,
      row.updatedAt,
    );
  }
}