import { Injectable } from '@nestjs/common';
import { MYDATA_CATEGORIES, MyDataCategory } from './mydata-category.enum';
import { MyDataSnapshot } from './mydata-snapshot.entity';
import { MyDataSnapshotRepository } from './mydata-snapshot.repository';
import { MyDataBundleResult } from './mydata-bundle.result';

@Injectable()
export class MyDataService {
  constructor(private readonly snapshotRepository: MyDataSnapshotRepository) {}

  async getLatestBundle(
    userId: bigint,
    xrplAddress: string,
  ): Promise<MyDataBundleResult> {
    const latestMap = await this.snapshotRepository.findLatestByUserId(userId);
    const filtered = new Map<MyDataCategory, MyDataSnapshot>();
    for (const category of MYDATA_CATEGORIES) {
      const snapshot = latestMap.get(category);
      if (snapshot !== undefined) {
        filtered.set(category, snapshot);
      }
    }

    return new MyDataBundleResult(userId, xrplAddress, filtered);
  }

  findLatestByUserId(
    userId: bigint,
  ): Promise<Map<MyDataCategory, MyDataSnapshot>> {
    return this.snapshotRepository.findLatestByUserId(userId);
  }

  findLatestByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<MyDataSnapshot | null> {
    return this.snapshotRepository.findLatestByUserIdAndCategory(
      userId,
      category,
    );
  }
}
