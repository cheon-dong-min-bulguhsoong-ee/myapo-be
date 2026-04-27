import { IssuanceResultItem } from './issuance-result-item';

export class IssuanceBundleResult {
  constructor(
    public readonly userId: bigint,
    public readonly xrplAddress: string,
    public readonly items: IssuanceResultItem[],
  ) {}
}
