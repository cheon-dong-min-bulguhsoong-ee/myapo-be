import { ApiProperty } from '@nestjs/swagger';
import { MyDataBundleResult } from '../../../../domain/mydata/result/mydata-bundle.result';
import { MyDataSnapshotResponse } from './mydata-snapshot.response';

export class MyDataBundleResponse {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ type: () => MyDataSnapshotResponse, isArray: true })
  public readonly snapshots: MyDataSnapshotResponse[];

  constructor(xrplAddress: string, snapshots: MyDataSnapshotResponse[]) {
    this.xrplAddress = xrplAddress;
    this.snapshots = snapshots;
  }

  static from(result: MyDataBundleResult): MyDataBundleResponse {
    const snapshots: MyDataSnapshotResponse[] = [];
    for (const snapshot of result.snapshots.values()) {
      snapshots.push(MyDataSnapshotResponse.from(snapshot));
    }
    return new MyDataBundleResponse(result.xrplAddress, snapshots);
  }
}
