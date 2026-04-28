import { MyDataCategory } from '../common/mydata-category.enum';
import { AdmissionLog } from './admission-log.entity';
import { AdmissionResult } from './admission-result.enum';

export class VerifyAdmissionResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly result: AdmissionResult,
    public readonly missing: MyDataCategory[],
    public readonly log: AdmissionLog,
  ) {}
}
