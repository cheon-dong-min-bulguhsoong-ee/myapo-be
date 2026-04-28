import { MyDataCategory } from '../common/mydata-category.enum';

export class IssueXrplCredentialCommand {
  constructor(
    public readonly subjectAddress: string,
    public readonly category: MyDataCategory,
    public readonly dataHash: string,
    public readonly metadataUri: string,
    public readonly expiresAt: Date,
  ) {}
}
