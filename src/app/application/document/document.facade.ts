import {Injectable} from '@nestjs/common';
import {CreateDocumentCommand} from '../../domain/document/dto/create-document.command';
import {CreateDocumentResult} from '../../domain/document/dto/create-document.result';
import {DocumentService} from '../../domain/document/service/document.service';
import {UserService} from '../../domain/user/service/user.service';

/**
 * 문서 도메인 Facade — 컨텍스트의 모든 유스케이스 메서드를 모은다.
 *
 * 도메인 서비스 여러 개를 묶어서 유스케이스 한 번을 구성:
 *   - UserService.getActive  — 활성 사용자 검증 + 조회
 *   - DocumentService.create — 문서 발급 + 첫 단계 이벤트 INSERT
 *
 * 에러는 catch 하지 않고 그대로 흘려보낸다.
 * 글로벌 ApiExceptionHandler 가 DomainError 를 일괄 처리.
 */
@Injectable()
export class DocumentFacade {
    constructor(
        private readonly userService: UserService,
        private readonly documentService: DocumentService,
    ) {
    }

    async create(
        userId: bigint,
        documentTypeCode: string,
    ): Promise<CreateDocumentResult> {
        const user = await this.userService.getActive(userId);
        return await this.documentService.create(
            new CreateDocumentCommand(userId, documentTypeCode),
            user.personaType,
        );
    }
}
