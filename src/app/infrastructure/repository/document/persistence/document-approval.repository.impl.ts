import { Injectable } from "@nestjs/common";
import { Prisma, DocumentApproval as ApprovalRow } from "@prisma/client";
import { DomainError } from "../../../../domain/common/error/domain.error";
import { ErrorCode } from "../../../../domain/common/error/error-code";
import { DocumentApproval } from "../../../../domain/document/entity/document-approval.entity";
import { DocumentStage } from "../../../../domain/document/enum/document-stage.enum";
import {
  CreateDocumentApprovalInput,
  DocumentApprovalRepository,
} from "../../../../domain/document/repository/document-approval.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class DocumentApprovalRepositoryImpl extends DocumentApprovalRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateDocumentApprovalInput): Promise<DocumentApproval> {
    try {
      const row = await this.prisma.documentApproval.create({
        data: {
          documentId: input.documentId,
          stage: input.stage,
          xrplTxHash: input.xrplTxHash,
          approvedAt: input.approvedAt,
        },
      });
      return this.toEntity(row);
    } catch (e) {
      // uniq_document_approvals_doc_stage 위반 = 같은 단계 중복 승인.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new DomainError(ErrorCode.Document.STAGE_ALREADY_APPROVED, {
          stage: input.stage,
        });
      }
      throw e;
    }
  }

  private toEntity(row: ApprovalRow): DocumentApproval {
    return new DocumentApproval(
      row.id,
      row.documentId,
      row.stage as DocumentStage,
      row.xrplTxHash,
      row.approvedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
