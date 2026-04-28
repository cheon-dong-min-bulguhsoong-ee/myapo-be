import { MyDataSnapshot } from './mydata-snapshot.entity';
import { MyDataCategory } from '../common/mydata-category.enum';
import { CreateMyDataSnapshotCommand } from './create-mydata-snapshot.command';

export abstract class MyDataSnapshotRepository {
  abstract findLatestByUserId(
    userId: bigint,
  ): Promise<Map<MyDataCategory, MyDataSnapshot>>;

  abstract findLatestByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<MyDataSnapshot | null>;

  abstract create(
    command: CreateMyDataSnapshotCommand,
  ): Promise<MyDataSnapshot>;
}
