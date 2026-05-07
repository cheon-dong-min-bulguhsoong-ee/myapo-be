import {Injectable} from '@nestjs/common';
import {DocumentService} from '../../domain/document/service/document.service';
import {UserService} from '../../domain/user/service/user.service';
import {AdvanceDocumentStageReq} from '../../interfaces/document/req/advance-document-stage.req';
import {ApproveDocumentReq} from '../../interfaces/document/req/approve-document.req';
import {CreateDocumentReq} from '../../interfaces/document/req/create-document.req';
import {AdvanceDocumentStageRes} from '../../interfaces/document/res/advance-document-stage.res';
import {ApproveDocumentRes} from '../../interfaces/document/res/approve-document.res';
import {CreateDocumentRes} from '../../interfaces/document/res/create-document.res';

/**
 * 문서 도메인 Facade — 컨텍스트의 모든 유스케이스 메서드를 모은다.
 *
 * 책임:
 *   - 인터페이스 레이어의 Request 를 받아 도메인 입력으로 풀어 service 호출
 *   - 도메인 Result 를 Response 로 매핑(`Res.from(domainResult)`)해서 반환
 *   - 도메인 service 여러 개 조합해 한 유스케이스 구성
 *
 * Command/Query 같은 별도 DTO 를 도입하지 않는다 — Request 가 인풋 carrier 역할.
 * DomainError 는 catch 하지 않는다(글로벌 핸들러로 흐름).
 */
@Injectable()
export class DocumentFacade {
    constructor(
        private readonly documentService: DocumentService,
        private readonly userService: UserService
    ) {
    }

    async create(
        request: CreateDocumentReq,
        userId: bigint,
    ): Promise<CreateDocumentRes> {
        const user = await this.userService.getActive(userId);
        const result = await this.documentService.create(
            userId,
            request.documentTypeCode,
            user.personaType,
        );
        return CreateDocumentRes.from(result);
    }

    async approve(
        request: ApproveDocumentReq,
        userId: bigint,
    ): Promise<ApproveDocumentRes> {
        await this.userService.getActive(userId);
        const result = await this.documentService.approve(
            userId,
            request.documentCode,
            request.xrplTxHash,
        );
        return ApproveDocumentRes.from(result);
    }

    async advanceStage(
        request: AdvanceDocumentStageReq,
        userId: bigint,
    ): Promise<AdvanceDocumentStageRes> {
        await this.userService.getActive(userId);
        const result = await this.documentService.advanceStage(
            userId,
            request.documentCode,
        );
        return AdvanceDocumentStageRes.from(result);
    }
}
