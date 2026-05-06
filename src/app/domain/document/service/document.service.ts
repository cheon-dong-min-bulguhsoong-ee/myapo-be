import {Injectable} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {PersonaType} from '../../common/enum/persona-type.enum';
import {DomainError} from '../../common/error/domain.error';
import {ErrorCode} from '../../common/error/error-code';
import {CreateDocumentCommand} from '../dto/create-document.command';
import {CreateDocumentResult} from '../dto/create-document.result';
import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStageStatus} from '../enum/document-stage-status.enum';
import {DocumentStatus} from '../enum/document-status.enum';
import {DocumentStageRepository} from '../repository/document-stage.repository';
import {DocumentTypeRepository} from '../repository/document-type.repository';
import {DocumentRepository} from '../repository/document.repository';

/**
 * 문서 도메인 서비스.
 *
 * - "문서(Document)" 라는 한 도메인 컨텍스트의 모든 핵심 비즈니스 로직을 담는다.
 * - 현재는 발급 신청(create) 만 구현. 추후 revoke·extend·archive 등 메서드가 추가된다.
 * - 외부 라이브러리(@prisma/client·xrpl 등) 를 직접 알지 않는다 — 포트(repository) 만 의존.
 */
@Injectable()
export class DocumentService {
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly documentStageRepository: DocumentStageRepository,
        private readonly documentTypeRepository: DocumentTypeRepository,
    ) {
    }

    /**
     * 사용자가 문서 발급을 신청한다.
     *
     * 와이어프레임 A-01 의 "발급 신청할게요" CTA 한 번에 다음이 모두 일어난다:
     *   1) 카탈로그 검증 — 존재 (활성 여부는 repository 가 필터링) / 페르소나 일치
     *   2) Document 신규 생성 — status=PROGRESS · currentStage=RECEIVED
     *   3) DocumentStage 첫 이벤트 INSERT — RECEIVED · PENDING
     *
     * 즉 "문서 생성" 과 "5단계 파이프라인 시작" 은 분리된 두 액션이 아니라
     * **단일 트랜잭션**이다. 이후 단계(PRE_REVIEW 이후) 는 별도 워커가
     * DocumentStage 행을 누적하며 currentStage 를 갱신한다.
     */
    async create(
        command: CreateDocumentCommand,
        userPersona: PersonaType,
    ): Promise<CreateDocumentResult> {
        const documentType = await this.documentTypeRepository.findByCode(
            command.documentTypeCode,
        );
        if (documentType === null) {
            throw new DomainError(ErrorCode.Document.TYPE_NOT_FOUND, {
                code: command.documentTypeCode,
            });
        }
        if (documentType.personaType !== userPersona) {
            throw new DomainError(ErrorCode.Document.PERSONA_MISMATCH, {
                typeCode: documentType.code,
                userPersona,
                typePersona: documentType.personaType,
            });
        }

        const requestedAt = new Date();

        // documentCode 는 외부 노출용 UUID — id (BIGSERIAL) 노출 금지 정책.
        const document = await this.documentRepository.create({
            documentCode: randomUUID(),
            userId: command.userId,
            documentTypeCode: documentType.code,
            status: DocumentStatus.PROGRESS,
            currentStage: DocumentStage.RECEIVED,
            requestedAt,
        });

        // 첫 단계 이벤트. status=PENDING 인 이유:
        // 워커가 큐에서 집어 올려 IN_PROGRESS 로 전이시키기 전이므로 "대기" 상태.
        await this.documentStageRepository.create({
            documentId: document.id,
            stage: DocumentStage.RECEIVED,
            status: DocumentStageStatus.PENDING,
            startedAt: requestedAt,
        });

        return new CreateDocumentResult(
            document.documentCode,
            document.documentTypeCode,
            document.status,
            document.currentStage,
            document.requestedAt,
        );
    }
}
