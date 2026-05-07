import {Injectable} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {PersonaType} from '../../common/enum/persona-type.enum';
import {DomainError} from '../../common/error/domain.error';
import {ErrorCode} from '../../common/error/error-code';
import {ApproveDocumentResult} from '../dto/approve-document.result';
import {CreateDocumentResult} from '../dto/create-document.result';
import {DocumentStage, nextDocumentStage} from '../enum/document-stage.enum';
import {DocumentStageStatus} from '../enum/document-stage-status.enum';
import {DocumentStatus} from '../enum/document-status.enum';
import {DocumentApprovalRepository} from '../repository/document-approval.repository';
import {DocumentStageRepository} from '../repository/document-stage.repository';
import {DocumentTypeRepository} from '../repository/document-type.repository';
import {DocumentRepository} from '../repository/document.repository';

/**
 * 문서 도메인 서비스.
 *
 * - "문서(Document)" 라는 한 도메인 컨텍스트의 모든 핵심 비즈니스 로직을 담는다.
 * - 외부 라이브러리(@prisma/client·xrpl 등) 를 직접 알지 않는다 — 포트(repository) 만 의존.
 * - 모든 메서드는 풀어진 원시값 인자로 받는다 (Command/Query 객체 도입 X — domain 이
 *   상위 레이어 DTO 에 의존하지 않도록).
 */
@Injectable()
export class DocumentService {
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly documentStageRepository: DocumentStageRepository,
        private readonly documentTypeRepository: DocumentTypeRepository,
        private readonly documentApprovalRepository: DocumentApprovalRepository,
    ) {
    }

    /**
     * 사용자가 문서 발급을 신청한다.
     *
     * 와이어프레임 A-01 의 "발급 신청할게요" CTA 한 번에 다음이 모두 일어난다:
     *   1) 카탈로그 검증 — 존재 (활성 여부는 repository 가 필터링) / 페르소나 일치
     *   2) Document 신규 생성 — status=AWAITING_APPROVAL · currentStage=AUTHORITY_ISSUED
     *   3) DocumentStage 첫 이벤트 INSERT — AUTHORITY_ISSUED · PENDING
     *
     * 즉 "문서 생성" 과 "5단계 파이프라인 시작" 은 분리된 두 액션이 아니라
     * **단일 트랜잭션**이다. 이후 단계(DOCUMENT_ARRIVED 이후) 는 별도 워커가
     * DocumentStage 행을 누적하며 currentStage 를 갱신한다.
     */
    async create(
        userId: bigint,
        documentTypeCode: string,
        userPersona: PersonaType,
    ): Promise<CreateDocumentResult> {
        const documentType = await this.documentTypeRepository.findByCode(documentTypeCode);
        if (documentType === null) {
            throw new DomainError(ErrorCode.Document.TYPE_NOT_FOUND, {
                code: documentTypeCode,
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
            userId,
            documentTypeCode: documentType.code,
            // 기관에서 발급받았다 치고 문서 발급하면 일단 사용자 승인 대기 전까지 보냄
            // TODO: 이 부분 기관 발급 되면 정석 단계 "PROGRESS(대기중)" 로 수정 필요
            status: DocumentStatus.AWAITING_APPROVAL,
            currentStage: DocumentStage.AUTHORITY_ISSUED,
            requestedAt,
        });

        // 첫 단계 이벤트. status=PENDING 인 이유:
        // 워커가 큐에서 집어 올려 IN_PROGRESS 로 전이시키기 전이므로 "대기" 상태.
        await this.documentStageRepository.create({
            documentId: document.id,
            stage: DocumentStage.AUTHORITY_ISSUED,
            status: DocumentStageStatus.PENDING,
            startedAt: requestedAt,
        });

        // TODO: 문서 발급 후 크레덴셜 발급하는 트리거 발동 필요 (API든, 이벤트든)
        return new CreateDocumentResult(
            document.documentCode,
            document.documentTypeCode,
            document.status,
            document.currentStage,
            document.requestedAt,
        );
    }

    /**
     * 사용자가 현재 stage 의 크레덴셜에 서명해 "다음 stage 진입 OK" 를 알린다.
     *
     * 1) documentCode 로 Document 조회 + 소유자 검증 (X-User-Id 와 일치)
     * 2) 현재 currentStage 다음 stage 계산 — 종착지(WALLET_STORED) 면 거부
     * 3) DocumentApproval 1행 INSERT — stage = "통과시킨 다음 stage"
     *
     * 본 메서드는 currentStage 전이를 수행하지 않는다 (별도 stage update 책임).
     * 같은 단계 중복 승인은 (document_id, stage) UNIQUE 제약으로 repository 레이어에서 차단.
     */
    async approve(
        userId: bigint,
        documentCode: string,
        xrplTxHash: string,
    ): Promise<ApproveDocumentResult> {
        const document = await this.documentRepository.findByCode(documentCode);
        if (document === null) {
            throw new DomainError(ErrorCode.Document.NOT_FOUND, {documentCode});
        }
        if (document.userId !== userId) {
            throw new DomainError(ErrorCode.Document.NOT_OWNED, {documentCode});
        }

        const approvedStage = nextDocumentStage(document.currentStage);
        if (approvedStage === null) {
            throw new DomainError(ErrorCode.Document.ALREADY_FINAL_STAGE, {
                documentCode,
                currentStage: document.currentStage,
            });
        }

        const approvedAt = new Date();
        const approval = await this.documentApprovalRepository.create({
            documentId: document.id,
            stage: approvedStage,
            xrplTxHash,
            approvedAt,
        });

        return new ApproveDocumentResult(
            document.documentCode,
            approval.stage,
            approval.xrplTxHash,
            approval.approvedAt,
        );
    }
}
