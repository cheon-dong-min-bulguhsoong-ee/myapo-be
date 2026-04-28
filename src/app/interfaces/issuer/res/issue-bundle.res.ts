import { ApiProperty } from '@nestjs/swagger';
import { IssuanceBundleResult } from '../../../domain/issuer/dto/issuance-bundle.result';
import { IssueResultItemRes } from './issue-result-item.res';

export class IssueBundleRes {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ type: () => IssueResultItemRes, isArray: true })
  public readonly results: IssueResultItemRes[];

  constructor(xrplAddress: string, results: IssueResultItemRes[]) {
    this.xrplAddress = xrplAddress;
    this.results = results;
  }

  static from(result: IssuanceBundleResult): IssueBundleRes {
    const items = result.items.map((item) => IssueResultItemRes.from(item));
    return new IssueBundleRes(result.xrplAddress, items);
  }
}
