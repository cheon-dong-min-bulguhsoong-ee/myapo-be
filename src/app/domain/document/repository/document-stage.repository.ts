import {DocumentStageEvent} from '../entity/document-stage-event.entity';
import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStageStatus} from '../enum/document-stage-status.enum';

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
}
