import { IssueXrplCredentialCommand } from './issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from './set-deep-freeze.command';
import { VerifyDomainAdmissionCommand } from './verify-domain-admission.command';
import { XrplAdmissionResult } from './xrpl-admission.result';
import { XrplCredentialIssueResult } from './xrpl-credential-issue.result';
import { XrplFreezeResult } from './xrpl-freeze.result';

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
