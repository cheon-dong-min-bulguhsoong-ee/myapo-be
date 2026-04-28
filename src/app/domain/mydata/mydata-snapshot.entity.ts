import { MyDataCategory } from '../common/mydata-category.enum';

export class MyDataSnapshot {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint,
    public readonly category: MyDataCategory,
    public readonly rawData: Record<string, unknown>,
    public readonly dataHash: string,
    public readonly source: string,
    public readonly fetchedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
