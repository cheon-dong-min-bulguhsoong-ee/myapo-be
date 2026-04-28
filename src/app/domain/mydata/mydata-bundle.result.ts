import { MyDataCategory } from '../common/mydata-category.enum';
import { MyDataSnapshot } from './mydata-snapshot.entity';

export class MyDataBundleResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly snapshots: Map<MyDataCategory, MyDataSnapshot>,
  ) {}
}
