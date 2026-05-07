import {Injectable} from '@nestjs/common';
import {DocumentStage as StageRow} from '@prisma/client';
import {DocumentStageEvent} from '../../../../domain/document/entity/document-stage-event.entity';
import {DocumentStageStatus} from '../../../../domain/document/enum/document-stage-status.enum';
import {DocumentStage} from '../../../../domain/document/enum/document-stage.enum';
import {
    CreateStageEventInput,
    DocumentStageRepository,
} from '../../../../domain/document/repository/document-stage.repository';
import {PrismaService} from '../../../prisma/prisma.service';

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
                status: {in: [DocumentStageStatus.PENDING, DocumentStageStatus.IN_PROGRESS]},
                isDelete: false,
            },
            data: {
                status: DocumentStageStatus.DONE,
                completedAt,
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
