import { ApiProperty } from '@nestjs/swagger';
import { MyDataSnapshot } from '../../../../domain/mydata/entity/mydata-snapshot.entity';
import { MyDataCategory } from '../../../../domain/mydata/enum/mydata-category.enum';

export class MyDataSnapshotResponse {
  @ApiProperty({ enum: MyDataCategory, enumName: 'MyDataCategory' })
  public readonly category: MyDataCategory;

  @ApiProperty({ example: 'government-api' })
  public readonly source: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  public readonly fetchedAt: string;

  @ApiProperty({ example: 'sha256-abc123' })
  public readonly dataHash: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  public readonly rawData: Record<string, unknown>;

  constructor(
    category: MyDataCategory,
    source: string,
    fetchedAt: string,
    dataHash: string,
    rawData: Record<string, unknown>,
  ) {
    this.category = category;
    this.source = source;
    this.fetchedAt = fetchedAt;
    this.dataHash = dataHash;
    this.rawData = rawData;
  }

  static from(snapshot: MyDataSnapshot): MyDataSnapshotResponse {
    return new MyDataSnapshotResponse(
      snapshot.category,
      snapshot.source,
      snapshot.fetchedAt.toISOString(),
      snapshot.dataHash,
      snapshot.rawData,
    );
  }
}
