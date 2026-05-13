import { DocumentMvpDetailResult } from "../dto/document-mvp-detail.result";
import { DocumentMvpListItemResult } from "../dto/document-mvp-list-item.result";
import { DocumentMvp } from "../entity/document-mvp.entity";
import { DocumentMvpStageStatus } from "../enum/document-mvp-stage-status.enum";
import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";

export interface CreateDocumentMvpInput {
  documentCode: string;
  userId: bigint;
  documentTypeCode: string;
  status: DocumentMvpStatus;
  currentStage: DocumentMvpStage;
  requestedAt: Date;
}

export interface UpdateDocumentMvpStageInput {
  currentStage: DocumentMvpStage;
  status: DocumentMvpStatus;
  issuedAt: Date | null;
}

export interface CreateMvpStageEventInput {
  documentId: bigint;
  stage: DocumentMvpStage;
  status: DocumentMvpStageStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  s3ObjectKey?: string | null;
}

export interface FindMvpListInput {
  userId: bigint;
}

export abstract class DocumentMvpRepository {
  /**
   * 문서 1건 생성 + stage 이벤트들 시드 (atomic).
   */
  abstract createWithSeedStages(
    input: CreateDocumentMvpInput,
    seededStages: CreateMvpStageEventInput[],
  ): Promise<DocumentMvp>;

  abstract findByCode(documentCode: string): Promise<DocumentMvp | null>;

  abstract updateStage(
    documentId: bigint,
    input: UpdateDocumentMvpStageInput,
  ): Promise<DocumentMvp>;

  /**
   * 현 stage 의 PENDING 이벤트를 DONE 으로 마감.
   */
  abstract completePendingStage(
    documentId: bigint,
    stage: DocumentMvpStage,
    completedAt: Date,
  ): Promise<void>;

  abstract createStageEvent(input: CreateMvpStageEventInput): Promise<void>;

  abstract findDetailByCode(
    documentCode: string,
  ): Promise<DocumentMvpDetailResult | null>;

  abstract findListByUser(
    input: FindMvpListInput,
  ): Promise<DocumentMvpListItemResult[]>;
}
