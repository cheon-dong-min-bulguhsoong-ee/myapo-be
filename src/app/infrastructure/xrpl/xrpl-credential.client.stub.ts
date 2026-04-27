import { Injectable, Logger } from '@nestjs/common';
import { XrplCredentialClient } from '../../domain/xrpl/client/xrpl-credential.client';
import { IssueXrplCredentialCommand } from '../../domain/xrpl/client/command/issue-xrpl-credential.command';
import { SetDeepFreezeCommand } from '../../domain/xrpl/client/command/set-deep-freeze.command';
import { VerifyDomainAdmissionCommand } from '../../domain/xrpl/client/command/verify-domain-admission.command';
import { XrplAdmissionResult } from '../../domain/xrpl/client/result/xrpl-admission.result';
import { XrplCredentialIssueResult } from '../../domain/xrpl/client/result/xrpl-credential-issue.result';
import { XrplFreezeResult } from '../../domain/xrpl/client/result/xrpl-freeze.result';

const SUCCESS_CODE = 'tesSUCCESS';

@Injectable()
export class XrplCredentialClientStub extends XrplCredentialClient {
  private readonly logger = new Logger(XrplCredentialClientStub.name);

  async issueCredential(
    command: IssueXrplCredentialCommand,
  ): Promise<XrplCredentialIssueResult> {
    this.logger.log(
      `[stub] CredentialCreate ${command.category} -> ${command.subjectAddress}`,
    );
    const txHash = this.fakeHash(`${command.dataHash}${command.category}`);
    return new XrplCredentialIssueResult(
      txHash,
      SUCCESS_CODE,
      0,
      BigInt(12),
      this.commandToRawResponse(command),
    );
  }

  async setDeepFreeze(command: SetDeepFreezeCommand): Promise<XrplFreezeResult> {
    this.logger.log(`[stub] DeepFreeze -> ${command.subjectAddress}`);
    const txHash = this.fakeHash(
      `freeze:${command.subjectAddress}:${Date.now()}`,
    );
    return new XrplFreezeResult(txHash, SUCCESS_CODE, {
      stub: true,
      op: 'TrustSet#tfSetDeepFreeze',
      subjectAddress: command.subjectAddress,
    });
  }

  async verifyDomainAdmission(
    command: VerifyDomainAdmissionCommand,
  ): Promise<XrplAdmissionResult> {
    this.logger.log(
      `[stub] verifyDomain ${command.domainId} <- ${command.subjectAddress}`,
    );
    return new XrplAdmissionResult(true, SUCCESS_CODE);
  }

  private fakeHash(seed: string): string {
    const padded = seed.padEnd(64, '0');
    let hex = '';
    for (let i = 0; i < 64; i++) {
      const code = padded.charCodeAt(i);
      const last = code.toString(16).padStart(2, '0').slice(-1);
      hex += last.toUpperCase();
    }
    return hex;
  }

  private commandToRawResponse(
    command: IssueXrplCredentialCommand,
  ): Record<string, unknown> {
    return {
      stub: true,
      subjectAddress: command.subjectAddress,
      category: command.category,
      dataHash: command.dataHash,
      metadataUri: command.metadataUri,
      expiresAt: command.expiresAt.toISOString(),
    };
  }
}
