import { Injectable } from "@nestjs/common";
import { DocumentStage as StageRow } from "@prisma/client";
import { DocumentStageEvent } from "../../../../domain/document/entity/document-stage-event.entity";
import { DocumentStageStatus } from "../../../../domain/document/enum/document-stage-status.enum";
import { DocumentStage } from "../../../../domain/document/enum/document-stage.enum";
import {
  CreateStageEventInput,
  DocumentStageRepository,
} from "../../../../domain/document/repository/document-stage.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class DocumentStageRepositoryImpl extends DocumentStageRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateStageEventInput): Promise<DocumentStageEvent> {
    const row = await this.prisma.documentStage.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        status: input.status,
        startedAt: input.startedAt,
        completedAt: input.completedAt ?? null,
      },
    });
    return this.toEntity(row);
  }

  async completeActive(
    documentId: bigint,
    stage: DocumentStage,
    completedAt: Date,
  ): Promise<void> {
    await this.prisma.documentStage.updateMany({
      where: {
        documentId,
        stage,
        status: {
          in: [DocumentStageStatus.PENDING, DocumentStageStatus.IN_PROGRESS],
        },
        isDelete: false,
      },
      data: {
        status: DocumentStageStatus.DONE,
        completedAt,
      },
    });
  }

  async findLatestByDocumentIdAndStage(
    documentId: bigint,
    stage: DocumentStage,
  ): Promise<DocumentStageEvent | null> {
    const row = await this.prisma.documentStage.findFirst({
      where: { documentId, stage, isDelete: false },
      orderBy: { createdAt: "desc" },
    });
    return row === null ? null : this.toEntity(row);
  }

  async setS3ObjectKey(
    documentId: bigint,
    stage: DocumentStage,
    s3ObjectKey: string,
  ): Promise<void> {
    const latest = await this.prisma.documentStage.findFirst({
      where: { documentId, stage, isDelete: false },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (latest !== null) {
      await this.prisma.documentStage.update({
        where: { id: latest.id },
        data: { s3ObjectKey },
      });
      return;
    }
    // (documentId, stage) 행이 아직 없으면 PENDING 상태로 신규 INSERT.
    await this.prisma.documentStage.create({
      data: {
        documentId,
        stage,
        status: DocumentStageStatus.PENDING,
        s3ObjectKey,
        startedAt: new Date(),
      },
    });
  }

  private toEntity(row: StageRow): DocumentStageEvent {
    return new DocumentStageEvent(
      row.id,
      row.documentId,
      row.stage as DocumentStage,
      row.status as DocumentStageStatus,
      row.txHash,
      row.s3ObjectKey,
      row.startedAt,
      row.completedAt,
      row.failureReason,
      row.createdAt,
      row.updatedAt,
    );
  }
}
