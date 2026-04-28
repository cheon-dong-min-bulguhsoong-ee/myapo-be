import { Injectable } from '@nestjs/common';
import { User as UserRow } from '@prisma/client';
import { User } from '../../../../domain/user/entity/user.entity';
import { UserStatus } from '../../../../domain/user/enum/user-status.enum';
import { UserRepository } from '../../../../domain/user/repository/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: bigint): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async findByXrplAddress(xrplAddress: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { xrplAddress, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async findByTossCi(tossCi: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { tossCi, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async updateStatus(id: bigint, status: UserStatus): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { status },
    });
    return this.toEntity(row);
  }

  private toEntity(row: UserRow): User {
    return new User(
      row.id,
      row.tossCi,
      row.tossDi,
      row.xrplAddress,
      row.encryptedSeed,
      row.kmsKeyId,
      row.status as UserStatus,
      row.createdAt,
      row.updatedAt,
    );
  }
}
