import { Injectable } from '@nestjs/common';
import { MyDataSnapshot as MyDataSnapshotRow, Prisma } from '@prisma/client';
import { MyDataSnapshot } from '../../domain/mydata/entity/mydata-snapshot.entity';
import { MyDataCategory } from '../../domain/mydata/enum/mydata-category.enum';
import { MyDataSnapshotRepository } from '../../domain/mydata/repository/mydata-snapshot.repository';
import { CreateMyDataSnapshotCommand } from '../../domain/mydata/repository/command/create-mydata-snapshot.command';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaMyDataSnapshotRepository extends MyDataSnapshotRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findLatestByUserId(
    userId: bigint,
  ): Promise<Map<MyDataCategory, MyDataSnapshot>> {
    const rows = await this.prisma.myDataSnapshot.findMany({
      where: { userId, isDelete: false },
      orderBy: [{ category: 'asc' }, { fetchedAt: 'desc' }],
    });
    const result = new Map<MyDataCategory, MyDataSnapshot>();
    for (const row of rows) {
      const category = row.category as MyDataCategory;
      if (!result.has(category)) {
        result.set(category, this.toEntity(row));
      }
    }
    return result;
  }

  async findLatestByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<MyDataSnapshot | null> {
    const row = await this.prisma.myDataSnapshot.findFirst({
      where: { userId, category, isDelete: false },
      orderBy: { fetchedAt: 'desc' },
    });
    return row === null ? null : this.toEntity(row);
  }

  async create(command: CreateMyDataSnapshotCommand): Promise<MyDataSnapshot> {
    const row = await this.prisma.myDataSnapshot.create({
      data: {
        userId: command.userId,
        category: command.category,
        rawData: command.rawData as Prisma.InputJsonValue,
        dataHash: command.dataHash,
        source: command.source,
        fetchedAt: command.fetchedAt ?? new Date(),
      },
    });
    return this.toEntity(row);
  }

  private toEntity(row: MyDataSnapshotRow): MyDataSnapshot {
    return new MyDataSnapshot(
      row.id,
      row.userId,
      row.category as MyDataCategory,
      row.rawData as Record<string, unknown>,
      row.dataHash,
      row.source,
      row.fetchedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
