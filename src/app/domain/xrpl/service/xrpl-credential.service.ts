import { Injectable } from '@nestjs/common';
import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { IssueXrplCredentialCommand } from '../dto/issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from '../dto/set-deep-freeze.command';
import { XrplCredentialClient } from '../client/xrpl-credential.client';
import { XrplCredentialIssueResult } from '../dto/xrpl-credential-issue.result';
import { XrplFreezeResult } from '../dto/xrpl-freeze.result';

@Injectable()
export class XrplCredentialService {
  constructor(private readonly xrplClient: XrplCredentialClient) {}

  issueCredential(
    subjectAddress: string,
    category: MyDataCategory,
    dataHash: string,
    metadataUri: string,
    expiresAt: Date,
  ): Promise<XrplCredentialIssueResult> {
    return this.xrplClient.issueCredential(
      new IssueXrplCredentialCommand(
        subjectAddress,
        category,
        dataHash,
        metadataUri,
        expiresAt,
      ),
    );
  }

  setDeepFreeze(subjectAddress: string): Promise<XrplFreezeResult> {
    return this.xrplClient.setDeepFreeze(
      new SetDeepFreezeCommand(subjectAddress),
    );
  }
}
