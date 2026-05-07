import {ApiProperty} from '@nestjs/swagger';
import {AdvanceDocumentStageResult} from '../../../domain/document/dto/advance-document-stage.result';
import {DocumentStage} from '../../../domain/document/enum/document-stage.enum';
import {DocumentStatus} from '../../../domain/document/enum/document-status.enum';

/**
 * 문서 단계 전이 응답 Body.
 *
 * 전이 후 documents.current_stage / status / issuedAt 스냅샷.
 * WALLET_STORED 도달 시에만 status=VALID 와 issuedAt 가 채워진다.
 */
export class AdvanceDocumentStageRes {
    @ApiProperty({
        description: '전이 처리된 문서의 외부 노출 코드 (UUID).',
        example: '9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    })
    readonly documentCode: string;

    @ApiProperty({
        enum: DocumentStage,
        description:
            '전이 후 currentStage. ' +
            'AUTHORITY_ISSUED → DOCUMENT_ARRIVED → TRANSLATED_NOTARIZED → APOSTILLE_ISSUED → WALLET_STORED 순서로 1단계 전진.',
        example: DocumentStage.DOCUMENT_ARRIVED,
    })
    readonly currentStage: DocumentStage;

    @ApiProperty({
        enum: DocumentStatus,
        description:
            '전이 후 status. WALLET_STORED 도달 시 VALID, 그 외에는 AWAITING_APPROVAL 유지.',
        example: DocumentStatus.AWAITING_APPROVAL,
    })
    readonly status: DocumentStatus;

    @ApiProperty({
        description:
            '문서 발급 완료 시각 (ISO 8601, UTC). WALLET_STORED 도달 시점에만 채워진다.',
        nullable: true,
        example: null,
    })
    readonly issuedAt: string | null;

    constructor(
        documentCode: string,
        currentStage: DocumentStage,
        status: DocumentStatus,
        issuedAt: string | null,
    ) {
        this.documentCode = documentCode;
        this.currentStage = currentStage;
        this.status = status;
        this.issuedAt = issuedAt;
    }

    static from(result: AdvanceDocumentStageResult): AdvanceDocumentStageRes {
        return new AdvanceDocumentStageRes(
            result.documentCode,
            result.currentStage,
            result.status,
            result.issuedAt === null ? null : result.issuedAt.toISOString(),
        );
    }
}
