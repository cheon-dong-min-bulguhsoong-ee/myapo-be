import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { MyDataSnapshot } from '../entity/mydata-snapshot.entity';

export class MyDataBundleResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly snapshots: Map<MyDataCategory, MyDataSnapshot>,
  ) {}
}
