import { ApiProperty } from '@nestjs/swagger';
import { IssuanceBundleResult } from '../../../../domain/issuer/result/issuance-bundle.result';
import { IssueResultItemResponse } from './issue-result-item.response';

export class IssueBundleResponse {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ type: () => IssueResultItemResponse, isArray: true })
  public readonly results: IssueResultItemResponse[];

  constructor(xrplAddress: string, results: IssueResultItemResponse[]) {
    this.xrplAddress = xrplAddress;
    this.results = results;
  }

  static from(result: IssuanceBundleResult): IssueBundleResponse {
    const items = result.items.map((item) => IssueResultItemResponse.from(item));
    return new IssueBundleResponse(result.xrplAddress, items);
  }
}
