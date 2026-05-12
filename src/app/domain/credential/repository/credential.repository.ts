import { Credential } from "../entity/credential.entity";
import { CredentialIssueRequest } from "../entity/credential-issue-request.entity";
import { CredentialSubmission } from "../entity/credential-submission.entity";
import { CredentialIssueRequestStatus } from "../enum/credential-issue-request-status.enum";
import { CredentialStatus } from "../enum/credential-status.enum";
import { CredentialSubmissionStatus } from "../enum/credential-submission-status.enum";
import { IssuePipelineStage } from "../enum/issue-pipeline-stage.enum";
import {
  XrplCredentialTransactionEvidenceResult,
  XrplCredentialTransactionKind,
} from "../dto/xrpl-credential-evidence.result";

export interface CreateCredentialIssueRequestInput {
  issueRequestCode: string;
  userId: bigint;
  documentTypeCode: string;
  documentCode: string;
  status: CredentialIssueRequestStatus;
  currentStage: IssuePipelineStage;
  requestedAt: Date;
}

export interface CreateCredentialInput {
  credentialCode: string;
  issueRequestId: bigint;
  userId: bigint;
  documentTypeCode: string;
  documentTypeName: string;
  issuerCode: string;
  status: CredentialStatus;
  currentStage: IssuePipelineStage;
  issuedAt: Date;
  expiresAt: Date;
}

export interface MarkCredentialIssueRequestFailedInput {
  issueRequestId: bigint;
  failedAt: Date;
  failureReason: string;
}

export interface MarkCredentialRevokedInput {
  credentialId: bigint;
  revokedAt: Date;
}

export interface CreateCredentialXrplTransactionInput {
  credentialId: bigint;
  evidence: XrplCredentialTransactionEvidenceResult;
  failureReason?: string | null;
}

export interface CreateCredentialSubmissionInput {
  submissionCode: string;
  credentialId: bigint;
  credentialCode: string;
  userId: bigint;
  submissionRequestId: string;
  recipientInstitutionId: string;
  recipientInstitutionName: string;
  status: CredentialSubmissionStatus;
  submittedAt: Date;
}

export abstract class CredentialRepository {
  abstract createIssueRequest(
    input: CreateCredentialIssueRequestInput,
  ): Promise<CredentialIssueRequest>;
  abstract markIssueRequestFailed(
    input: MarkCredentialIssueRequestFailedInput,
  ): Promise<CredentialIssueRequest>;
  abstract findIssueRequestByCode(
    issueRequestCode: string,
  ): Promise<CredentialIssueRequest | null>;
  abstract findCredentialByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<Credential | null>;
  abstract createCredential(input: CreateCredentialInput): Promise<Credential>;
  abstract markCredentialRevoked(
    input: MarkCredentialRevokedInput,
  ): Promise<Credential>;
  abstract createXrplTransaction(
    input: CreateCredentialXrplTransactionInput,
  ): Promise<bigint>;
  abstract updateCredentialCreatedXrplTransaction(input: {
    credentialId: bigint;
    createdXrplTransactionId: bigint | null;
  }): Promise<void>;
  abstract updateCredentialAcceptedXrplTransaction(input: {
    credentialId: bigint;
    acceptedXrplTransactionId: bigint | null;
  }): Promise<void>;
  abstract updateCredentialRevokedXrplTransaction(input: {
    credentialId: bigint;
    revokedXrplTransactionId: bigint | null;
  }): Promise<void>;
  abstract findCredentialByCode(
    credentialCode: string,
  ): Promise<Credential | null>;
  abstract listCredentialsByUserId(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<Credential[]>;
  abstract listCredentialsByUserIdAndCurrentStage(
    userId: bigint,
    currentStage: IssuePipelineStage,
  ): Promise<Credential[]>;
  abstract hasCredentialXrplTransaction(
    credentialId: bigint,
    transactionKind: XrplCredentialTransactionKind,
  ): Promise<boolean>;
  abstract countSubmissionsByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<number>;
  abstract createSubmission(
    input: CreateCredentialSubmissionInput,
  ): Promise<CredentialSubmission>;
  abstract listSubmissionsByCredentialId(
    credentialId: bigint,
  ): Promise<CredentialSubmission[]>;
  abstract listSubmissionsByUserId(
    userId: bigint,
  ): Promise<CredentialSubmission[]>;
  abstract updateCredential(credential: Credential): Promise<void>;
  abstract markCredentialAccepted(input: {
    credentialId: bigint;
  }): Promise<Credential>;
  abstract updateIssueRequestSuspension(
    issueRequestId: bigint,
    isSuspended: boolean,
  ): Promise<void>;
}
