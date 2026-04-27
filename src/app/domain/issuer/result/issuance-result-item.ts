import { MyDataCategory } from '../../mydata/enum/mydata-category.enum';
import { IssuanceResultStatus } from '../enum/issuance-result-status.enum';

export class IssuanceResultItem {
  constructor(
    public readonly category: MyDataCategory,
    public readonly status: IssuanceResultStatus,
    public readonly txHash: string | null = null,
    public readonly resultCode: string | null = null,
    public readonly reason: string | null = null,
  ) {}

  static issued(
    category: MyDataCategory,
    txHash: string,
    resultCode: string,
  ): IssuanceResultItem {
    return new IssuanceResultItem(
      category,
      IssuanceResultStatus.ISSUED,
      txHash,
      resultCode,
    );
  }

  static skipped(
    category: MyDataCategory,
    reason: string,
  ): IssuanceResultItem {
    return new IssuanceResultItem(
      category,
      IssuanceResultStatus.SKIPPED,
      null,
      null,
      reason,
    );
  }

  static failed(
    category: MyDataCategory,
    reason: string,
  ): IssuanceResultItem {
    return new IssuanceResultItem(
      category,
      IssuanceResultStatus.FAILED,
      null,
      null,
      reason,
    );
  }
}
