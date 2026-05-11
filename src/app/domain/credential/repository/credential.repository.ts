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
  documentId: string | null;
  status: CredentialIssueRequestStatus;
  currentStage: IssuePipelineStage;
  currentSubstep: string | null;
  authEventId: string | null;
  requestedAt: Date;
}

export interface CreateCredentialInput {
  credentialCode: string;
  issueRequestId: bigint;
  issueRequestCode: string;
  userId: bigint;
  documentTypeCode: string;
  documentTypeName: string;
  issuerCode: string;
  status: CredentialStatus;
  walletAddress: string;
  isMock: boolean;
  xrplCredentialId: string | null;
  xrplNetwork: string | null;
  xrplIssuerAddress: string | null;
  xrplSubjectAddress: string | null;
  xrplCredentialType: string | null;
  xrplTxHash: string | null;
  xrplLedgerIndex: bigint | null;
  xrplEngineResult: string | null;
  xrplValidated: boolean | null;
  sourceDocumentRef: string | null;
  authEventId: string | null;
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
  failureReason: string | null;
}

export interface CreateCredentialXrplTransactionInput {
  credentialId: bigint;
  evidence: XrplCredentialTransactionEvidenceResult;
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
  authEventId: string | null;
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
  ): Promise<void>;
  abstract findCredentialByCode(
    credentialCode: string,
  ): Promise<Credential | null>;
  abstract listCredentialsByUserId(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<Credential[]>;
  abstract listCredentialsByUserIdAndSourceDocumentRef(
    userId: bigint,
    sourceDocumentRef: string,
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
}
