import { Injectable } from "@nestjs/common";
import { CredentialService } from "../../domain/credential/service/credential.service";
import { CredentialStatus } from "../../domain/credential/enum/credential-status.enum";
import { UserService } from "../../domain/user/service/user.service";
import { AcceptTestnetCredentialReq } from "../../interfaces/credential/req/accept-testnet-credential.req";
import { CreateCredentialIssueRequestReq } from "../../interfaces/credential/req/create-credential-issue-request.req";
import { DeleteTestnetCredentialReq } from "../../interfaces/credential/req/delete-testnet-credential.req";
import { PrepareDeleteTestnetCredentialReq } from "../../interfaces/credential/req/prepare-delete-testnet-credential.req";
import { SubmitCredentialReq } from "../../interfaces/credential/req/submit-credential.req";
import {
  CreateCredentialIssueRequestRes,
  CredentialIssueRequestRes,
} from "../../interfaces/credential/res/credential-issue-request.res";
import {
  CredentialDetailRes,
  ListCredentialsRes,
} from "../../interfaces/credential/res/credential.res";
import {
  ListCredentialsByIssuePipelineStageRes,
} from "../../interfaces/credential/res/credential-issue-pipeline-stage.res";
import {
  ListCredentialSubmissionsRes,
  SubmitCredentialRes,
} from "../../interfaces/credential/res/credential-submission.res";
import { XrplCredentialEvidenceRes } from "../../interfaces/credential/res/xrpl-credential-evidence.res";
import { XrplCredentialTransactionRes } from "../../interfaces/credential/res/xrpl-credential-transaction.res";

@Injectable()
export class CredentialFacade {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly userService: UserService,
  ) {}

  async createIssueRequest(
    req: CreateCredentialIssueRequestReq,
    userId: bigint,
  ): Promise<CreateCredentialIssueRequestRes> {
    const user = await this.userService.getProfile(userId);
    const result = await this.credentialService.createIssueRequest(
      userId,
      req.documentTypeId,
      req.documentCode,
      req.currentStage,
      user.wallet.xrplAddress,
    );
    return CreateCredentialIssueRequestRes.from(result);
  }

  async getIssueRequest(
    userId: bigint,
    issueRequestId: string,
  ): Promise<CredentialIssueRequestRes> {
    const result = await this.credentialService.getIssueRequest(
      userId,
      issueRequestId,
    );
    return CredentialIssueRequestRes.from(result);
  }

  async listCredentials(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<ListCredentialsRes> {
    const result = await this.credentialService.listCredentials(userId, status);
    return ListCredentialsRes.from(result);
  }

  async listCredentialsByIssuePipelineStage(
    userId: bigint,
    currentStage: string,
  ): Promise<ListCredentialsByIssuePipelineStageRes> {
      const result =
      await this.credentialService.listCredentialsByIssuePipelineStage(
        userId,
        currentStage,
      );
    return ListCredentialsByIssuePipelineStageRes.from(result);
  }

  async getCredentialDetail(
    userId: bigint,
    credentialId: string,
  ): Promise<CredentialDetailRes> {
    const result = await this.credentialService.getCredentialDetail(
      userId,
      credentialId,
    );
    return CredentialDetailRes.from(result);
  }

  async submitCredential(
    userId: bigint,
    credentialId: string,
    req: SubmitCredentialReq,
  ): Promise<SubmitCredentialRes> {
    const result = await this.credentialService.submitCredential(
      userId,
      credentialId,
      req.submissionRequestId,
      req.consentConfirmed,
    );
    return SubmitCredentialRes.from(result);
  }

  async listSubmissions(
    userId: bigint,
    credentialId?: string,
  ): Promise<ListCredentialSubmissionsRes> {
    const result = await this.credentialService.listSubmissions(
      userId,
      credentialId,
    );
    return ListCredentialSubmissionsRes.from(result);
  }

  async prepareAcceptTestnetCredential(
    userId: bigint,
    credentialId: string,
  ): Promise<XrplCredentialTransactionRes> {
    const result = await this.credentialService.prepareAcceptTestnetCredential(
      userId,
      credentialId,
    );
    return XrplCredentialTransactionRes.from(result);
  }

  async acceptTestnetCredential(
    userId: bigint,
    credentialId: string,
    req: AcceptTestnetCredentialReq,
  ): Promise<XrplCredentialEvidenceRes> {
    const result = await this.credentialService.acceptTestnetCredential(
      userId,
      credentialId,
      req.signedTransactionBlob,
    );
    return XrplCredentialEvidenceRes.from(result);
  }

  async prepareDeleteTestnetCredential(
    userId: bigint,
    credentialId: string,
    req: PrepareDeleteTestnetCredentialReq,
  ): Promise<XrplCredentialTransactionRes> {
    const result = await this.credentialService.prepareDeleteTestnetCredential(
      userId,
      credentialId,
      req.submitterRole,
    );
    return XrplCredentialTransactionRes.from(result);
  }

  async deleteTestnetCredential(
    userId: bigint,
    credentialId: string,
    req: DeleteTestnetCredentialReq,
  ): Promise<XrplCredentialEvidenceRes> {
    const result = await this.credentialService.deleteTestnetCredential(
      userId,
      credentialId,
      req.submitterRole,
      req.signedTransactionBlob,
    );
    return XrplCredentialEvidenceRes.from(result);
  }
}
