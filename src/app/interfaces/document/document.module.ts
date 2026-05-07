import {Module} from '@nestjs/common';
import {DocumentFacade} from '../../application/document/document.facade';
import {DocumentService} from '../../domain/document/service/document.service';
import {UserService} from '../../domain/user/service/user.service';
import {DocumentController} from './controller/document.controller';

/**
 * 문서 도메인 wiring.
 *
 * - controllers: 이 도메인의 HTTP 진입점
 * - providers: facade 가 의존하는 도메인 서비스들 + 컨텍스트 Facade
 *   · DocumentService — 자기 컨텍스트
 *   · UserService     — 다른 컨텍스트지만 facade 가 의존하므로 등록
 *
 * Repository 포트 → impl binding 은 InfrastructureModule (Global) 에서 일괄 처리.
 */
@Module({
    controllers: [DocumentController],
    providers: [DocumentService, UserService, DocumentFacade],
})
export class DocumentModule {
}
