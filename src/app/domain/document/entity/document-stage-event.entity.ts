import { DocumentStage } from '../enum/document-stage.enum';
import { DocumentStageStatus } from '../enum/document-stage-status.enum';

export class DocumentStageEvent {
  constructor(
    public readonly id: bigint,
    public readonly documentId: bigint,
    public readonly stage: DocumentStage,
    public readonly status: DocumentStageStatus,
    public readonly txHash: string | null,
    public readonly s3ObjectKey: string | null,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly failureReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
