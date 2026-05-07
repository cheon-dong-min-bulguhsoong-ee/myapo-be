import {applyDecorators} from '@nestjs/common';
import {ApiHeader, ApiOperation, ApiTags} from '@nestjs/swagger';
import {ApiCommonRes} from '../../common/api-common-res.decorator';
import {AdvanceDocumentStageRes} from '../res/advance-document-stage.res';
import {ApproveDocumentRes} from '../res/approve-document.res';
import {CreateDocumentRes} from '../res/create-document.res';

/**
 * 컨트롤러 비즈니스 데코레이터를 한 곳에 모아서 컨트롤러 본문을 얇게 유지한다.
 * 새 엔드포인트가 생기면 여기에 X<XSwaggerApi>() 형태로 추가.
 */

export const DocumentApiTags = (): ClassDecorator => ApiTags('Documents');

export const CreateDocumentSwaggerApi = (): MethodDecorator =>
    applyDecorators(
        ApiOperation({
            summary: '문서 발급 신청 (Document 생성 + 5단계 파이프라인 시작)',
            description:
                '사용자가 문서 카탈로그에서 한 종류를 선택해 발급을 신청한다. ' +
                '한 트랜잭션으로 Document(status=PROGRESS, currentStage=AUTHORITY_ISSUED) 행과 ' +
                '첫 DocumentStage 이벤트(stage=AUTHORITY_ISSUED, status=PENDING) 가 함께 INSERT 된다. ' +
                '이후 단계는 별도 워커가 순차적으로 처리한다.\n\n' +
                '*임시 인증*: 현재는 `X-User-Id` 헤더로 사용자를 식별한다. ' +
                '로그인/JWT 가드 도입 시 헤더 대신 인증 토큰에서 추출되도록 교체될 예정.',
        }),
        ApiHeader({
            name: 'X-User-Id',
            description:
                '사용자 ID (임시 인증). JWT 가드 도입 시 제거 예정. ' +
                '시드 SQL 의 기본 사용자는 id=1.',
            required: true,
            example: '1',
        }),
        ApiCommonRes(CreateDocumentRes),
    );

export const ApproveDocumentSwaggerApi = (): MethodDecorator =>
    applyDecorators(
        ApiOperation({
            summary: '문서 단계 승인 (사용자 크리덴셜 서명 결과 제출)',
            description:
                '사용자가 현재 stage 의 크리덴셜에 자기 seed 로 서명한 XRPL TX 해시를 제출한다. ' +
                '서버는 documents.current_stage 를 보고 다음 stage 를 계산해 ' +
                'document_approvals 테이블에 1행 INSERT 한다 (stage = 통과시킨 다음 stage).\n\n' +
                '*제약*: ' +
                '(1) 본인이 신청한 문서만 승인 가능. ' +
                '(2) 이미 마지막 단계(WALLET_STORED) 에 도달한 문서는 거부. ' +
                '(3) 같은 단계 중복 승인은 (document_id, stage) UNIQUE 제약으로 차단.\n\n' +
                '*임시 인증*: 현재는 `X-User-Id` 헤더로 사용자를 식별. JWT 가드 도입 시 제거 예정.',
        }),
        ApiHeader({
            name: 'X-User-Id',
            description:
                '사용자 ID (임시 인증). JWT 가드 도입 시 제거 예정. 시드 SQL 의 기본 사용자는 id=1.',
            required: true,
            example: '1',
        }),
        ApiCommonRes(ApproveDocumentRes),
    );

export const AdvanceDocumentStageSwaggerApi = (): MethodDecorator =>
    applyDecorators(
        ApiOperation({
            summary: '문서 단계 전이 (누적된 사용자 승인 기반 currentStage 진행)',
            description:
                '`POST /documents/approvals` 로 누적된 사용자 승인을 바탕으로 ' +
                'documents.current_stage 를 다음 stage 로 1단계 전진시킨다.\n\n' +
                '서버 처리:\n' +
                '1) documents.current_stage 의 미완료 DocumentStage 이벤트를 DONE 으로 마감\n' +
                '2) documents.current_stage 를 다음 stage 로 갱신 ' +
                '(WALLET_STORED 도달 시 status=VALID, issuedAt=now)\n' +
                '3) 다음 stage 의 DocumentStage 이벤트 신규 INSERT ' +
                '(WALLET_STORED 는 종착지이므로 즉시 DONE)\n\n' +
                '*제약*: ' +
                '(1) 본인이 신청한 문서만 전이 가능. ' +
                '(2) 이미 마지막 단계(WALLET_STORED) 에 도달한 문서는 거부. ' +
                '(3) 다음 stage 에 대한 DocumentApproval 행이 없으면 거부 ' +
                '(승인 없이 전이 불가).\n\n' +
                '*임시 인증*: 현재는 `X-User-Id` 헤더로 사용자를 식별. JWT 가드 도입 시 제거 예정.',
        }),
        ApiHeader({
            name: 'X-User-Id',
            description:
                '사용자 ID (임시 인증). JWT 가드 도입 시 제거 예정.',
            required: true,
            example: '1',
        }),
        ApiCommonRes(AdvanceDocumentStageRes),
    );
