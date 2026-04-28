import { ApiProperty } from '@nestjs/swagger';
import { MyDataBundleResult } from '../../../domain/mydata/mydata-bundle.result';
import { MyDataSnapshotRes } from './mydata-snapshot.res';

export class MyDataBundleRes {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ type: () => MyDataSnapshotRes, isArray: true })
  public readonly snapshots: MyDataSnapshotRes[];

  constructor(xrplAddress: string, snapshots: MyDataSnapshotRes[]) {
    this.xrplAddress = xrplAddress;
    this.snapshots = snapshots;
  }

  static from(result: MyDataBundleResult): MyDataBundleRes {
    const snapshots: MyDataSnapshotRes[] = [];
    for (const snapshot of result.snapshots.values()) {
      snapshots.push(MyDataSnapshotRes.from(snapshot));
    }
    return new MyDataBundleRes(result.xrplAddress, snapshots);
  }
}
