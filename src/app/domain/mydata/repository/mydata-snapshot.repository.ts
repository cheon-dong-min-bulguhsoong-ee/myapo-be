import { MyDataSnapshot } from '../entity/mydata-snapshot.entity';
import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { CreateMyDataSnapshotCommand } from '../dto/create-mydata-snapshot.command';

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
