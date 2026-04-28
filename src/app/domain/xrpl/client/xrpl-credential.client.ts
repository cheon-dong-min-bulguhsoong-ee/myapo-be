import { IssueXrplCredentialCommand } from '../dto/issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from '../dto/set-deep-freeze.command';
import { VerifyDomainAdmissionCommand } from '../dto/verify-domain-admission.command';
import { XrplAdmissionResult } from '../dto/xrpl-admission.result';
import { XrplCredentialIssueResult } from '../dto/xrpl-credential-issue.result';
import { XrplFreezeResult } from '../dto/xrpl-freeze.result';

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
