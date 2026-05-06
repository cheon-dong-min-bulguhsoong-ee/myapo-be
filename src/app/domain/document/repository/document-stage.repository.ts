import { DocumentStageEvent } from '../entity/document-stage-event.entity';
import { DocumentStage } from '../enum/document-stage.enum';
import { DocumentStageStatus } from '../enum/document-stage-status.enum';

export interface CreateStageEventInput {
  documentId: bigint;
  stage: DocumentStage;
  status: DocumentStageStatus;
  startedAt: Date | null;
}

export abstract class DocumentStageRepository {
  abstract create(input: CreateStageEventInput): Promise<DocumentStageEvent>;
}
