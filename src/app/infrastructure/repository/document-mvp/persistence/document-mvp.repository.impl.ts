import { Injectable } from "@nestjs/common";
import { Document as DocumentRow } from "@prisma/client";
import {
  DocumentMvpDetailResult,
  DocumentMvpStageDetail,
} from "../../../../domain/document-mvp/dto/document-mvp-detail.result";
import { DocumentMvpListItemResult } from "../../../../domain/document-mvp/dto/document-mvp-list-item.result";
import { toUiSteps } from "../../../../domain/document-mvp/dto/document-mvp-ui-step.result";
import { DocumentMvp } from "../../../../domain/document-mvp/entity/document-mvp.entity";
import { DocumentMvpStageStatus } from "../../../../domain/document-mvp/enum/document-mvp-stage-status.enum";
import {
  DocumentMvpStage,
  ORDERED_MVP_STAGES,
} from "../../../../domain/document-mvp/enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../../../../domain/document-mvp/enum/document-mvp-status.enum";
import {
  CreateDocumentMvpInput,
  CreateMvpStageEventInput,
  DocumentMvpRepository,
  FindMvpListInput,
  UpdateDocumentMvpStageInput,
} from "../../../../domain/document-mvp/repository/document-mvp.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class DocumentMvpRepositoryImpl extends DocumentMvpRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createWithSeedStages(
    input: CreateDocumentMvpInput,
    seededStages: CreateMvpStageEventInput[],
  ): Promise<DocumentMvp> {
    const [documentRow] = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          documentCode: input.documentCode,
          userId: input.userId,
          documentTypeCode: input.documentTypeCode,
          status: input.status,
          currentStage: input.currentStage,
          requestedAt: input.requestedAt,
        },
      });
      await tx.documentStage.createMany({
        data: seededStages.map((s) => ({
          documentId: doc.id,
          stage: s.stage,
          status: s.status,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          s3ObjectKey: s.s3ObjectKey ?? null,
        })),
      });
      return [doc];
    });

    return this.toEntity(documentRow);
  }

  async findByCode(documentCode: string): Promise<DocumentMvp | null> {
    const row = await this.prisma.document.findFirst({
      where: { documentCode, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  async updateStage(
    documentId: bigint,
    input: UpdateDocumentMvpStageInput,
  ): Promise<DocumentMvp> {
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

  async completePendingStage(
    documentId: bigint,
    stage: DocumentMvpStage,
    completedAt: Date,
  ): Promise<void> {
    await this.prisma.documentStage.updateMany({
      where: {
        documentId,
        stage,
        status: DocumentMvpStageStatus.PENDING,
        isDelete: false,
      },
      data: {
        status: DocumentMvpStageStatus.DONE,
        completedAt,
      },
    });
  }

  async createStageEvent(input: CreateMvpStageEventInput): Promise<void> {
    await this.prisma.documentStage.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        status: input.status,
        startedAt: input.startedAt,
        completedAt: input.completedAt,
        s3ObjectKey: input.s3ObjectKey ?? null,
      },
    });
  }

  async findDetailByCode(
    documentCode: string,
  ): Promise<DocumentMvpDetailResult | null> {
    const row = await this.prisma.document.findFirst({
      where: { documentCode, isDelete: false },
      include: {
        documentType: { include: { issuer: true } },
        stages: { where: { isDelete: false }, orderBy: { createdAt: "asc" } },
      },
    });
    if (row === null) {
      return null;
    }

    // 같은 stage 가 여러 행 있을 경우 가장 최신 1건만 노출.
    const latestByStage = new Map<DocumentMvpStage, (typeof row.stages)[number]>();
    for (const ev of row.stages) {
      latestByStage.set(ev.stage as DocumentMvpStage, ev);
    }

    const stageDetails: DocumentMvpStageDetail[] = ORDERED_MVP_STAGES.map(
      (s) => {
        const ev = latestByStage.get(s);
        return new DocumentMvpStageDetail(
          s,
          ev ? (ev.status as DocumentMvpStageStatus) : null,
          ev?.startedAt ?? null,
          ev?.completedAt ?? null,
          ev?.failureReason ?? null,
          ev?.s3ObjectKey ?? null,
        );
      },
    );

    const status = row.status as DocumentMvpStatus;
    const uiSteps = toUiSteps(stageDetails, status, row.issuedAt);

    return new DocumentMvpDetailResult(
      row.documentCode,
      row.documentTypeCode,
      row.documentType.name,
      row.documentType.issuer.name,
      row.documentType.issuer.iconLabel,
      row.documentType.issuer.countryCode,
      status,
      row.currentStage as DocumentMvpStage,
      row.requestedAt,
      row.issuedAt,
      stageDetails,
      uiSteps,
    );
  }

  async findListByUser(
    input: FindMvpListInput,
  ): Promise<DocumentMvpListItemResult[]> {
    const rows = await this.prisma.document.findMany({
      where: { userId: input.userId, isDelete: false },
      include: { documentType: { include: { issuer: true } } },
      orderBy: { requestedAt: "desc" },
    });

    return rows.map(
      (row) =>
        new DocumentMvpListItemResult(
          row.documentCode,
          row.documentTypeCode,
          row.documentType.name,
          row.documentType.issuer.name,
          row.documentType.issuer.iconLabel,
          row.documentType.issuer.countryCode,
          row.status as DocumentMvpStatus,
          row.currentStage as DocumentMvpStage,
          row.requestedAt,
          row.issuedAt,
        ),
    );
  }

  private toEntity(row: DocumentRow): DocumentMvp {
    return new DocumentMvp(
      row.id,
      row.documentCode,
      row.userId,
      row.documentTypeCode,
      row.status as DocumentMvpStatus,
      row.currentStage as DocumentMvpStage,
      row.failureReason,
      row.requestedAt,
      row.issuedAt,
    );
  }
}
