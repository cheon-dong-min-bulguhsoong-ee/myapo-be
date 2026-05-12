import { Injectable } from "@nestjs/common";
import {
  CredentialIssueRequest as CredentialIssueRequestRow,
  CredentialSubmission as CredentialSubmissionRow,
  Prisma,
} from "@prisma/client";
import { DomainError } from "../../../../domain/common/error/domain.error";
import { ErrorCode } from "../../../../domain/common/error/error-code";
import { Credential } from "../../../../domain/credential/entity/credential.entity";
import { CredentialIssueRequest } from "../../../../domain/credential/entity/credential-issue-request.entity";
import { CredentialSubmission } from "../../../../domain/credential/entity/credential-submission.entity";
import { CredentialIssueRequestStatus } from "../../../../domain/credential/enum/credential-issue-request-status.enum";
import { CredentialStatus } from "../../../../domain/credential/enum/credential-status.enum";
import { CredentialSubmissionStatus } from "../../../../domain/credential/enum/credential-submission-status.enum";
import { IssuePipelineStage } from "../../../../domain/credential/enum/issue-pipeline-stage.enum";
import { XrplCredentialTransactionKind } from "../../../../domain/credential/dto/xrpl-credential-evidence.result";
import {
  CreateCredentialInput,
  CreateCredentialIssueRequestInput,
  CreateCredentialXrplTransactionInput,
  CreateCredentialSubmissionInput,
  CredentialRepository,
  MarkCredentialIssueRequestFailedInput,
  MarkCredentialRevokedInput,
} from "../../../../domain/credential/repository/credential.repository";
import { PrismaService } from "../../../prisma/prisma.service";

const credentialXrplTransactionSelect = {
  id: true,
  transactionKind: true,
  network: true,
  txHash: true,
  engineResult: true,
  failureReason: true,
  ledgerIndex: true,
  validated: true,
  feeDrops: true,
  accountAddress: true,
  issuerAddress: true,
  subjectAddress: true,
  credentialType: true,
  flags: true,
  objectSnapshot: true,
} satisfies Prisma.CredentialXrplTransactionSelect;

const credentialRowInclude = Prisma.validator<Prisma.CredentialDefaultArgs>()({
  include: {
    issueRequest: {
      select: {
        issueRequestCode: true,
      },
    },
    user: {
      include: {
        userWallet: {
          select: {
            xrplAddress: true,
          },
        },
      },
    },
    createdXrplTransaction: {
      select: credentialXrplTransactionSelect,
    },
    acceptedXrplTransaction: {
      select: credentialXrplTransactionSelect,
    },
    revokedXrplTransaction: {
      select: credentialXrplTransactionSelect,
    },
  },
});

type CredentialRowWithRelations = Prisma.CredentialGetPayload<
  typeof credentialRowInclude
>;

@Injectable()
export class CredentialRepositoryImpl extends CredentialRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createIssueRequest(
    input: CreateCredentialIssueRequestInput,
  ): Promise<CredentialIssueRequest> {
    const row = await this.prisma.credentialIssueRequest.create({
      data: {
        issueRequestCode: input.issueRequestCode,
        user: {
          connect: {
            id: input.userId,
          },
        },
        document: {
          connect: {
            documentCode: input.documentCode,
          },
        },
        documentType: {
          connect: {
            code: input.documentTypeCode,
          },
        },
        status: input.status,
        currentStage: input.currentStage,
        requestedAt: input.requestedAt,
      },
    });
    return this.toIssueRequestEntity(row);
  }

  async markIssueRequestFailed(
    input: MarkCredentialIssueRequestFailedInput,
  ): Promise<CredentialIssueRequest> {
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

  async findIssueRequestByCode(
    issueRequestCode: string,
  ): Promise<CredentialIssueRequest | null> {
    const row = await this.prisma.credentialIssueRequest.findFirst({
      where: { issueRequestCode, isDelete: false },
    });
    return row === null ? null : this.toIssueRequestEntity(row);
  }

  async findCredentialByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: { issueRequestId, isDelete: false },
      ...credentialRowInclude,
    });
    return row === null ? null : this.toCredentialEntity(row);
  }

  async createCredential(input: CreateCredentialInput): Promise<Credential> {
    const row: CredentialRowWithRelations = await this.prisma.credential.create({
      data: {
        credentialCode: input.credentialCode,
        issueRequest: {
          connect: {
            id: input.issueRequestId,
          },
        },
        user: {
          connect: {
            id: input.userId,
          },
        },
        documentType: {
          connect: {
            code: input.documentTypeCode,
          },
        },
        document: {
          connect: {
            documentCode: input.documentCode,
          },
        },
        documentTypeName: input.documentTypeName,
        issuerCode: input.issuerCode,
        status: input.status,
        currentStage: input.currentStage,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
      },
      ...credentialRowInclude,
    });
    return this.toCredentialEntity(row as CredentialRowWithRelations);
  }

  async markCredentialRevoked(
    input: MarkCredentialRevokedInput,
  ): Promise<Credential> {
    const row = await this.prisma.credential.update({
      where: { id: input.credentialId },
      data: {
        status: CredentialStatus.REVOKED,
        revokedAt: input.revokedAt,
      },
      ...credentialRowInclude,
    });
    return this.toCredentialEntity(row);
  }

  async markCredentialAccepted(input: {
    credentialId: bigint;
  }): Promise<Credential> {
    const row = await this.prisma.credential.update({
      where: { id: input.credentialId },
      data: {
        status: CredentialStatus.ACCEPTED,
      },
      ...credentialRowInclude,
    });
    return this.toCredentialEntity(row);
  }

  async createXrplTransaction(
    input: CreateCredentialXrplTransactionInput,
  ): Promise<bigint> {
    const evidence = input.evidence;
    const row = await this.prisma.credentialXrplTransaction.create({
      data: {
        credentialId: input.credentialId,
        transactionKind: evidence.transactionKind,
        network: evidence.network,
        txHash: evidence.transactionHash,
        engineResult: evidence.engineResult,
        failureReason: input.failureReason ?? null,
        ledgerIndex: evidence.ledgerIndex,
        validated: evidence.validated,
        feeDrops: evidence.feeDrops,
        accountAddress: evidence.account,
        issuerAddress: evidence.issuer,
        subjectAddress: evidence.subject,
        credentialType: evidence.credentialType,
        flags: evidence.flags,
        objectSnapshot:
          evidence.objectSnapshot === null
            ? Prisma.JsonNull
            : (evidence.objectSnapshot as Prisma.InputJsonValue),
      },
    });
    return row.id;
  }

  async updateCredentialCreatedXrplTransaction(input: {
    credentialId: bigint;
    createdXrplTransactionId: bigint | null;
  }): Promise<void> {
    await this.prisma.credential.update({
      where: { id: input.credentialId },
      data: {
        createdXrplTransactionId: input.createdXrplTransactionId,
      },
    });
  }

  async updateCredentialAcceptedXrplTransaction(input: {
    credentialId: bigint;
    acceptedXrplTransactionId: bigint | null;
  }): Promise<void> {
    await this.prisma.credential.update({
      where: { id: input.credentialId },
      data: {
        acceptedXrplTransactionId: input.acceptedXrplTransactionId,
      },
    });
  }

  async updateCredentialRevokedXrplTransaction(input: {
    credentialId: bigint;
    revokedXrplTransactionId: bigint | null;
  }): Promise<void> {
    await this.prisma.credential.update({
      where: { id: input.credentialId },
      data: {
        revokedXrplTransactionId: input.revokedXrplTransactionId,
      },
    });
  }

  async findCredentialByCode(
    credentialCode: string,
  ): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: { credentialCode, isDelete: false },
      ...credentialRowInclude,
    });
    return row === null ? null : this.toCredentialEntity(row);
  }

  async listCredentialsByUserId(
    userId: bigint,
    status?: CredentialStatus,
  ): Promise<Credential[]> {
    const rows = await this.prisma.credential.findMany({
      where: {
        userId,
        isDelete: false,
        ...(status === undefined ? {} : { status }),
      },
      orderBy: { issuedAt: "desc" },
      ...credentialRowInclude,
    });
    return rows.map((row) => this.toCredentialEntity(row));
  }

  async listCredentialsByUserIdAndCurrentStage(
    userId: bigint,
    currentStage: IssuePipelineStage,
  ): Promise<Credential[]> {
    const rows = await this.prisma.credential.findMany({
      where: {
        userId,
        isDelete: false,
        currentStage,
      },
      orderBy: { issuedAt: "desc" },
      ...credentialRowInclude,
    });
    return rows.map((row) => this.toCredentialEntity(row));
  }

  async hasCredentialXrplTransaction(
    credentialId: bigint,
    transactionKind: XrplCredentialTransactionKind,
  ): Promise<boolean> {
    const row = await this.prisma.credentialXrplTransaction.findFirst({
      where: {
        credentialId,
        transactionKind,
        isDelete: false,
      },
      select: { id: true },
    });
    return row !== null;
  }

  async countSubmissionsByIssueRequestId(
    issueRequestId: bigint,
  ): Promise<number> {
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

  async createSubmission(
    input: CreateCredentialSubmissionInput,
  ): Promise<CredentialSubmission> {
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
          submittedAt: input.submittedAt,
        },
      });
      return this.toSubmissionEntity(row);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new DomainError(ErrorCode.Credential.SUBMISSION_DUPLICATED, {
          submissionRequestId: input.submissionRequestId,
        });
      }
      throw e;
    }
  }

  async listSubmissionsByCredentialId(
    credentialId: bigint,
  ): Promise<CredentialSubmission[]> {
    const rows = await this.prisma.credentialSubmission.findMany({
      where: { credentialId, isDelete: false },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map((row) => this.toSubmissionEntity(row));
  }

  async listSubmissionsByUserId(
    userId: bigint,
  ): Promise<CredentialSubmission[]> {
    const rows = await this.prisma.credentialSubmission.findMany({
      where: { userId, isDelete: false },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map((row) => this.toSubmissionEntity(row));
  }

  async updateCredential(credential: Credential): Promise<void> {
    await this.prisma.credential.update({
      where: { id: credential.id },
      data: {
        status: credential.status,
        revokedAt: credential.revokedAt,
      },
    });
  }

  async updateIssueRequestSuspension(
    issueRequestId: bigint,
    isSuspended: boolean,
  ): Promise<void> {
    await this.prisma.credentialIssueRequest.update({
      where: { id: issueRequestId },
      data: { isSuspended } as any,
    });
  }

  private toIssueRequestEntity(
    row: CredentialIssueRequestRow,
  ): CredentialIssueRequest {
    const issueRequestRow = row as CredentialIssueRequestRow & {
      isSuspended: boolean;
    };
    return new CredentialIssueRequest(
      issueRequestRow.id,
      issueRequestRow.issueRequestCode,
      issueRequestRow.userId,
      issueRequestRow.documentTypeCode,
      issueRequestRow.documentCode,
      issueRequestRow.status as CredentialIssueRequestStatus,
      issueRequestRow.currentStage as IssuePipelineStage,
      issueRequestRow.isSuspended,
      issueRequestRow.requestedAt,
      issueRequestRow.issuedAt,
      issueRequestRow.failedAt,
      issueRequestRow.failureReason,
      issueRequestRow.createdAt,
      issueRequestRow.updatedAt,
    );
  }

  private toCredentialEntity(
    row: CredentialRowWithRelations,
  ): Credential {
    const createdTransaction = row.createdXrplTransaction ?? null;
    const acceptedTransaction = row.acceptedXrplTransaction ?? null;
    const revokedTransaction = row.revokedXrplTransaction ?? null;
    const latestTransaction =
      revokedTransaction ?? acceptedTransaction ?? createdTransaction;
    return new Credential(
      row.id,
      row.credentialCode,
      row.issueRequestId,
      row.issueRequest.issueRequestCode,
      row.userId,
      row.documentCode,
      row.documentTypeCode,
      row.documentTypeName,
      row.issuerCode,
      row.status as CredentialStatus,
      row.user.userWallet?.xrplAddress ?? "",
      latestTransaction === null
        ? null
        : `${latestTransaction.issuerAddress ?? latestTransaction.accountAddress}:${latestTransaction.subjectAddress ?? ""}:${latestTransaction.credentialType}`,
      latestTransaction?.network ?? null,
      latestTransaction?.issuerAddress ?? null,
      latestTransaction?.subjectAddress ?? null,
      latestTransaction?.credentialType ?? null,
      latestTransaction?.txHash ?? null,
      latestTransaction?.ledgerIndex ?? null,
      latestTransaction?.engineResult ?? null,
      latestTransaction?.validated ?? null,
      row.currentStage,
      row.issuedAt,
      row.expiresAt,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  private toSubmissionEntity(
    row: CredentialSubmissionRow,
  ): CredentialSubmission {
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
      row.submittedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
