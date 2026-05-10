import { Injectable } from "@nestjs/common";
import { Document as DocumentRow, Prisma } from "@prisma/client";
import {
  DocumentApprovalDetailResult,
  DocumentDetailResult,
  DocumentStageDetailResult,
} from "../../../../domain/document/dto/document-detail.result";
import { DocumentListItemResult } from "../../../../domain/document/dto/document-list-item.result";
import { Document } from "../../../../domain/document/entity/document.entity";
import { DocumentStage } from "../../../../domain/document/enum/document-stage.enum";
import { DocumentStageStatus } from "../../../../domain/document/enum/document-stage-status.enum";
import { DocumentStatus } from "../../../../domain/document/enum/document-status.enum";
import {
  CreateDocumentInput,
  DocumentListPage,
  DocumentRepository,
  FindDocumentListInput,
  UpdateDocumentStageInput,
} from "../../../../domain/document/repository/document.repository";
import { PrismaService } from "../../../prisma/prisma.service";

/**
 * 5단계 순서 — 응답에 항상 5건의 stage 항목을 정렬된 형태로 채워주기 위함.
 * Prisma 의 stages 행은 같은 stage 가 여러 번 나올 수 있어 (e.g. PENDING → DONE 마감),
 * 각 stage 별 "가장 최신 1건" 만 노출한다.
 */
const ORDERED_STAGES: DocumentStage[] = [
  DocumentStage.AUTHORITY_ISSUED,
  DocumentStage.DOCUMENT_ARRIVED,
  DocumentStage.TRANSLATED_NOTARIZED,
  DocumentStage.APOSTILLE_ISSUED,
  DocumentStage.WALLET_STORED,
];

@Injectable()
export class DocumentRepositoryImpl extends DocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateDocumentInput): Promise<Document> {
    const row = await this.prisma.document.create({
      data: {
        documentCode: input.documentCode,
        userId: input.userId,
        documentTypeCode: input.documentTypeCode,
        status: input.status,
        currentStage: input.currentStage,
        requestedAt: input.requestedAt,
      },
    });
    return this.toEntity(row);
  }

  async findByCode(documentCode: string): Promise<Document | null> {
    const row = await this.prisma.document.findFirst({
      where: { documentCode, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async updateStage(
    documentId: bigint,
    input: UpdateDocumentStageInput,
  ): Promise<Document> {
    const row = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        currentStage: input.currentStage,
        status: input.status,
        issuedAt: input.issuedAt,
      },
    });
    return this.toEntity(row);
  }

  async findList(input: FindDocumentListInput): Promise<DocumentListPage> {
    const where: Prisma.DocumentWhereInput = { isDelete: false };
    if (input.status !== undefined) {
      where.status = input.status;
    }
    if (input.documentTypeCode !== undefined) {
      where.documentTypeCode = input.documentTypeCode;
    }
    if (input.countryCode !== undefined) {
      // 국가 필터는 발급기관(Issuer.countryCode) 기준 — DocumentType 한 단계 건너 조인.
      where.documentType = {
        issuer: { countryCode: input.countryCode },
      };
    }
    if (input.q !== undefined && input.q.trim() !== "") {
      const q = input.q.trim();
      // documentCode 는 UUID 타입이라 부분일치 불가 — q 가 UUID 형식일 때만 exact 매치 추가.
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          q,
        );
      const orConditions: Prisma.DocumentWhereInput[] = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
      if (isUuid) {
        orConditions.push({ documentCode: q });
      }
      where.OR = orConditions;
    }

    const skip = (input.page - 1) * input.limit;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        include: {
          user: true,
          documentType: { include: { issuer: true } },
        },
        orderBy: { requestedAt: "desc" },
        skip,
        take: input.limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    const items: DocumentListItemResult[] = rows.map(
      (row) =>
        new DocumentListItemResult(
          row.documentCode,
          row.userId.toString(),
          row.user.name,
          row.user.email,
          row.documentTypeCode,
          row.documentType.name,
          row.documentType.issuer.countryCode,
          row.requestedAt,
          row.status as DocumentStatus,
          row.currentStage as DocumentStage,
        ),
    );

    return { items, total };
  }

  async findDetailByCode(
    documentCode: string,
  ): Promise<DocumentDetailResult | null> {
    const row = await this.prisma.document.findFirst({
      where: { documentCode, isDelete: false },
      include: {
        user: true,
        documentType: { include: { issuer: true } },
        stages: { where: { isDelete: false }, orderBy: { createdAt: "asc" } },
        approvals: {
          where: { isDelete: false },
          orderBy: { approvedAt: "asc" },
        },
      },
    });
    if (row === null) {
      return null;
    }

    // stage 별 "가장 최신 1건" 만 사용 — 같은 stage 의 마감 이력은 덮어 씌운다.
    const latestByStage = new Map<DocumentStage, (typeof row.stages)[number]>();
    for (const ev of row.stages) {
      latestByStage.set(ev.stage as DocumentStage, ev);
    }
    const stageDetails: DocumentStageDetailResult[] = ORDERED_STAGES.map(
      (s) => {
        const ev = latestByStage.get(s);
        return new DocumentStageDetailResult(
          s,
          ev ? (ev.status as DocumentStageStatus) : null,
          ev?.startedAt ?? null,
          ev?.completedAt ?? null,
          ev?.failureReason ?? null,
        );
      },
    );

    const approvalDetails: DocumentApprovalDetailResult[] = row.approvals.map(
      (a) =>
        new DocumentApprovalDetailResult(
          a.stage as DocumentStage,
          a.xrplTxHash,
          a.approvedAt,
        ),
    );

    // currentSubstep 은 service 에서 계산 — repo 는 null 로 채워서 반환.
    return new DocumentDetailResult(
      row.documentCode,
      row.userId.toString(),
      row.user.name,
      row.user.email,
      row.documentTypeCode,
      row.documentType.name,
      row.documentType.issuer.countryCode,
      row.requestedAt,
      row.issuedAt,
      row.status as DocumentStatus,
      row.currentStage as DocumentStage,
      null,
      stageDetails,
      approvalDetails,
    );
  }

  private toEntity(row: DocumentRow): Document {
    return new Document(
      row.id,
      row.documentCode,
      row.userId,
      row.documentTypeCode,
      row.status as DocumentStatus,
      row.currentStage as DocumentStage,
      row.failureReason,
      row.xrplCreateTxHash,
      row.xrplLedgerIndex,
      row.payloadHash,
      row.requestedAt,
      row.issuedAt,
      row.expiresAt,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
