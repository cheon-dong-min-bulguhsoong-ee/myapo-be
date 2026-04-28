import { Injectable } from '@nestjs/common';
import { MyDataCategory } from '../common/mydata-category.enum';
import { IssueXrplCredentialCommand } from './issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from './set-deep-freeze.command';
import { XrplCredentialClient } from './xrpl-credential.client';
import { XrplCredentialIssueResult } from './xrpl-credential-issue.result';
import { XrplFreezeResult } from './xrpl-freeze.result';

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
