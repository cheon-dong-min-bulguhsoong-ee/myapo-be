import { DocumentStageEvent } from "../entity/document-stage-event.entity";
import { DocumentStage } from "../enum/document-stage.enum";
import { DocumentStageStatus } from "../enum/document-stage-status.enum";

export interface CreateStageEventInput {
  documentId: bigint;
  stage: DocumentStage;
  status: DocumentStageStatus;
  startedAt: Date | null;
  // 생성 시점에 이미 마감된 단계(WALLET_STORED 종착지) 를 한 번에 기록하기 위함.
  // 일반 PENDING 이벤트에서는 null.
  completedAt?: Date | null;
}

export abstract class DocumentStageRepository {
  abstract create(input: CreateStageEventInput): Promise<DocumentStageEvent>;

  /**
   * 주어진 (documentId, stage) 의 미완료 이벤트(PENDING/IN_PROGRESS) 를 DONE 으로 마감.
   * 이미 종료(DONE/FAILED) 된 행은 건드리지 않는다 — idempotent.
   */
  abstract completeActive(
    documentId: bigint,
    stage: DocumentStage,
    completedAt: Date,
  ): Promise<void>;

  /**
   * (documentId, stage) 의 가장 최근 행 1건. 없으면 null.
   * 첨부 파일 다운로드 시 `s3_object_key` 룩업에 사용.
   */
  abstract findLatestByDocumentIdAndStage(
    documentId: bigint,
    stage: DocumentStage,
  ): Promise<DocumentStageEvent | null>;

  /**
   * (documentId, stage) 의 최신 행에 `s3_object_key` 를 갱신.
   * 해당 stage 에 행이 아직 없으면 PENDING 상태의 새 행을 만들어 함께 기록.
   * (예: 운영자가 stage 가 시작되기 전에 파일을 미리 올리는 경우)
   */
  abstract setS3ObjectKey(
    documentId: bigint,
    stage: DocumentStage,
    s3ObjectKey: string,
  ): Promise<void>;
}
