import { Injectable } from '@nestjs/common';
import {
  Credential as CredentialRow,
  CredentialIssueRequest as CredentialIssueRequestRow,
  CredentialSubmission as CredentialSubmissionRow,
  Prisma,
} from '@prisma/client';
import { DomainError } from '../../../../domain/common/error/domain.error';
import { ErrorCode } from '../../../../domain/common/error/error-code';
import { Credential } from '../../../../domain/credential/entity/credential.entity';
import { CredentialIssueRequest } from '../../../../domain/credential/entity/credential-issue-request.entity';
import { CredentialSubmission } from '../../../../domain/credential/entity/credential-submission.entity';
import { CredentialIssueRequestStatus } from '../../../../domain/credential/enum/credential-issue-request-status.enum';
import { CredentialStatus } from '../../../../domain/credential/enum/credential-status.enum';
import { CredentialSubmissionStatus } from '../../../../domain/credential/enum/credential-submission-status.enum';
import { IssuePipelineStage } from '../../../../domain/credential/enum/issue-pipeline-stage.enum';
import {
  CreateCredentialInput,
  CreateCredentialIssueRequestInput,
  CreateCredentialXrplTransactionInput,
  CreateCredentialSubmissionInput,
  CredentialRepository,
  MarkCredentialIssueRequestFailedInput,
} from '../../../../domain/credential/repository/credential.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CredentialRepositoryImpl extends CredentialRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createIssueRequest(input: CreateCredentialIssueRequestInput): Promise<CredentialIssueRequest> {
    const row = await this.prisma.credentialIssueRequest.create({
      data: {
        issueRequestCode: input.issueRequestCode,
        userId: input.userId,
        documentTypeCode: input.documentTypeCode,
        documentId: input.documentId,
        status: input.status,
        currentStage: input.currentStage,
        currentSubstep: input.currentSubstep,
        authEventId: input.authEventId,
        requestedAt: input.requestedAt,
      },
    });
    return this.toIssueRequestEntity(row);
  }

  async markIssueRequestFailed(input: MarkCredentialIssueRequestFailedInput): Promise<CredentialIssueRequest> {
    const row = await this.prisma.credentialIssueRequest.update({
      where: { id: input.issueRequestId },
      data: {
        status: CredentialIssueRequestStatus.FAILED,
        failedAt: input.failedAt,
        failureReason: input.failureReason,
      },
    });
    return this.toIssueRequestEntity(row);
  }

  async findIssueRequestByCode(issueRequestCode: string): Promise<CredentialIssueRequest | null> {
    const row = await this.prisma.credentialIssueRequest.findFirst({
      where: { issueRequestCode, isDelete: false },
    });
    return row === null ? null : this.toIssueRequestEntity(row);
  }

  async findCredentialByIssueRequestId(issueRequestId: bigint): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: { issueRequestId, isDelete: false },
    });
    return row === null ? null : this.toCredentialEntity(row);
  }

  async createCredential(input: CreateCredentialInput): Promise<Credential> {
    const row = await this.prisma.credential.create({
      data: {
        credentialCode: input.credentialCode,
        issueRequestId: input.issueRequestId,
        issueRequestCode: input.issueRequestCode,
        userId: input.userId,
        documentTypeCode: input.documentTypeCode,
        documentTypeName: input.documentTypeName,
        issuerCode: input.issuerCode,
        status: input.status,
        walletAddress: input.walletAddress,
        isMock: input.isMock,
        xrplCredentialId: input.xrplCredentialId,
        xrplNetwork: input.xrplNetwork,
        xrplIssuerAddress: input.xrplIssuerAddress,
        xrplSubjectAddress: input.xrplSubjectAddress,
        xrplCredentialType: input.xrplCredentialType,
        xrplTxHash: input.xrplTxHash,
        xrplLedgerIndex: input.xrplLedgerIndex,
        xrplEngineResult: input.xrplEngineResult,
        xrplValidated: input.xrplValidated,
        sourceDocumentRef: input.sourceDocumentRef,
        authEventId: input.authEventId,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
      },
    });
    return this.toCredentialEntity(row);
  }


  async createXrplTransaction(input: CreateCredentialXrplTransactionInput): Promise<void> {
    const evidence = input.evidence;
    await this.prisma.credentialXrplTransaction.create({
      data: {
        credentialId: input.credentialId,
        transactionKind: evidence.transactionKind,
        network: evidence.network,
        txHash: evidence.transactionHash,
        engineResult: evidence.engineResult,
        ledgerIndex: evidence.ledgerIndex,
        validated: evidence.validated,
        feeDrops: evidence.feeDrops,
        accountAddress: evidence.account,
        issuerAddress: evidence.issuer,
        subjectAddress: evidence.subject,
        credentialType: evidence.credentialType,
        flags: evidence.flags,
        objectSnapshot: evidence.objectSnapshot === null ? Prisma.JsonNull : evidence.objectSnapshot as Prisma.InputJsonValue,
      },
    });
  }

  async findCredentialByCode(credentialCode: string): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: { credentialCode, isDelete: false },
    });
    return row === null ? null : this.toCredentialEntity(row);
  }

  async listCredentialsByUserId(userId: bigint, status?: CredentialStatus): Promise<Credential[]> {
    const rows = await this.prisma.credential.findMany({
      where: { userId, status, isDelete: false },
      orderBy: { issuedAt: 'desc' },
    });
    return rows.map((row) => this.toCredentialEntity(row));
  }

  async countSubmissionsByIssueRequestId(issueRequestId: bigint): Promise<number> {
    const credential = await this.prisma.credential.findFirst({
      where: { issueRequestId, isDelete: false },
      select: { id: true },
    });
    if (credential === null) {
      return 0;
    }
    return this.prisma.credentialSubmission.count({
      where: { credentialId: credential.id, isDelete: false },
    });
  }

  async createSubmission(input: CreateCredentialSubmissionInput): Promise<CredentialSubmission> {
    try {
      const row = await this.prisma.credentialSubmission.create({
        data: {
          submissionCode: input.submissionCode,
          credentialId: input.credentialId,
          credentialCode: input.credentialCode,
          userId: input.userId,
          submissionRequestId: input.submissionRequestId,
          recipientInstitutionId: input.recipientInstitutionId,
          recipientInstitutionName: input.recipientInstitutionName,
          status: input.status,
          authEventId: input.authEventId,
          submittedAt: input.submittedAt,
        },
      });
      return this.toSubmissionEntity(row);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DomainError(ErrorCode.Credential.SUBMISSION_DUPLICATED, {
          submissionRequestId: input.submissionRequestId,
        });
      }
      throw e;
    }
  }

  async listSubmissionsByCredentialId(credentialId: bigint): Promise<CredentialSubmission[]> {
    const rows = await this.prisma.credentialSubmission.findMany({
      where: { credentialId, isDelete: false },
      orderBy: { submittedAt: 'desc' },
    });
    return rows.map((row) => this.toSubmissionEntity(row));
  }

  async listSubmissionsByUserId(userId: bigint): Promise<CredentialSubmission[]> {
    const rows = await this.prisma.credentialSubmission.findMany({
      where: { userId, isDelete: false },
      orderBy: { submittedAt: 'desc' },
    });
    return rows.map((row) => this.toSubmissionEntity(row));
  }

  private toIssueRequestEntity(row: CredentialIssueRequestRow): CredentialIssueRequest {
    return new CredentialIssueRequest(
      row.id,
      row.issueRequestCode,
      row.userId,
      row.documentTypeCode,
      row.documentId,
      row.status as CredentialIssueRequestStatus,
      row.currentStage as IssuePipelineStage,
      row.currentSubstep,
      row.authEventId,
      row.requestedAt,
      row.issuedAt,
      row.failedAt,
      row.failureReason,
      row.createdAt,
      row.updatedAt,
    );
  }

  private toCredentialEntity(row: CredentialRow): Credential {
    return new Credential(
      row.id,
      row.credentialCode,
      row.issueRequestId,
      row.issueRequestCode,
      row.userId,
      row.documentTypeCode,
      row.documentTypeName,
      row.issuerCode,
      row.status as CredentialStatus,
      row.walletAddress,
      row.isMock,
      row.xrplCredentialId,
      row.xrplNetwork,
      row.xrplIssuerAddress,
      row.xrplSubjectAddress,
      row.xrplCredentialType,
      row.xrplTxHash,
      row.xrplLedgerIndex,
      row.xrplEngineResult,
      row.xrplValidated,
      row.payloadHash,
      row.sourceDocumentRef,
      row.authEventId,
      row.issuedAt,
      row.expiresAt,
      row.revokedAt,
      row.failureReason,
      row.createdAt,
      row.updatedAt,
    );
  }

  private toSubmissionEntity(row: CredentialSubmissionRow): CredentialSubmission {
    return new CredentialSubmission(
      row.id,
      row.submissionCode,
      row.credentialId,
      row.credentialCode,
      row.userId,
      row.submissionRequestId,
      row.recipientInstitutionId,
      row.recipientInstitutionName,
      row.status as CredentialSubmissionStatus,
      row.rejectionReason,
      row.authEventId,
      row.submittedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
