import { IssueXrplCredentialCommand } from './command/issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from './command/set-deep-freeze.command';
import { VerifyDomainAdmissionCommand } from './command/verify-domain-admission.command';
import { XrplAdmissionResult } from './result/xrpl-admission.result';
import { XrplCredentialIssueResult } from './result/xrpl-credential-issue.result';
import { XrplFreezeResult } from './result/xrpl-freeze.result';

export abstract class XrplCredentialClient {
  abstract issueCredential(
    command: IssueXrplCredentialCommand,
  ): Promise<XrplCredentialIssueResult>;

  abstract setDeepFreeze(
    command: SetDeepFreezeCommand,
  ): Promise<XrplFreezeResult>;

  abstract verifyDomainAdmission(
    command: VerifyDomainAdmissionCommand,
  ): Promise<XrplAdmissionResult>;
}
