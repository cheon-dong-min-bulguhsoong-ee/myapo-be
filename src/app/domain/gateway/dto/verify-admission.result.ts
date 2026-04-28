import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { AdmissionLog } from '../entity/admission-log.entity';
import { AdmissionResult } from '../enum/admission-result.enum';

export class VerifyAdmissionResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly result: AdmissionResult,
    public readonly missing: MyDataCategory[],
    public readonly log: AdmissionLog,
  ) {}
}
