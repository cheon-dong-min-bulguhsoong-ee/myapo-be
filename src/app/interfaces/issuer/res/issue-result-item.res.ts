import { ApiProperty } from '@nestjs/swagger';
import { IssuanceResultItem } from '../../../domain/issuer/issuance-result-item';
import { IssuanceResultStatus } from '../../../domain/issuer/issuance-result-status.enum';
import { MyDataCategory } from '../../../domain/mydata/mydata-category.enum';

export class IssueResultItemRes {
  @ApiProperty({ enum: MyDataCategory, enumName: 'MyDataCategory' })
  public readonly category: MyDataCategory;

  @ApiProperty({ enum: IssuanceResultStatus, enumName: 'IssuanceResultStatus' })
  public readonly status: IssuanceResultStatus;

  @ApiProperty({ nullable: true, example: 'ABC123DEF456' })
  public readonly txHash: string | null;

  @ApiProperty({ nullable: true, example: 'tesSUCCESS' })
  public readonly resultCode: string | null;

  @ApiProperty({ nullable: true, example: 'Credential already issued' })
  public readonly reason: string | null;

  constructor(
    category: MyDataCategory,
    status: IssuanceResultStatus,
    txHash: string | null,
    resultCode: string | null,
    reason: string | null,
  ) {
    this.category = category;
    this.status = status;
    this.txHash = txHash;
    this.resultCode = resultCode;
    this.reason = reason;
  }

  static from(item: IssuanceResultItem): IssueResultItemRes {
    return new IssueResultItemRes(
      item.category,
      item.status,
      item.txHash,
      item.resultCode,
      item.reason,
    );
  }
}
