import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repository/user.repository';
import { UserNotFoundException } from '../../user/exception/user-not-found.exception';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../enum/mydata-category.enum';
import { MyDataSnapshot } from '../entity/mydata-snapshot.entity';
import { MyDataSnapshotRepository } from '../repository/mydata-snapshot.repository';
import { MyDataBundleResult } from '../result/mydata-bundle.result';

@Injectable()
export class MyDataService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly snapshotRepository: MyDataSnapshotRepository,
  ) {}

  async getBundleByXrplAddress(xrplAddress: string): Promise<MyDataBundleResult> {
    const user = await this.userRepository.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new UserNotFoundException(xrplAddress);
    }

    const latestMap = await this.snapshotRepository.findLatestByUserId(user.id);
    const filtered = new Map<MyDataCategory, MyDataSnapshot>();
    for (const category of MYDATA_CATEGORIES) {
      const snapshot = latestMap.get(category);
      if (snapshot !== undefined) {
        filtered.set(category, snapshot);
      }
    }

    return new MyDataBundleResult(user.id, user.xrplAddress, filtered);
  }

  async getCategory(
    xrplAddress: string,
    category: MyDataCategory,
  ): Promise<MyDataSnapshot | null> {
    const user = await this.userRepository.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new UserNotFoundException(xrplAddress);
    }
    return this.snapshotRepository.findLatestByUserIdAndCategory(
      user.id,
      category,
    );
  }
}
