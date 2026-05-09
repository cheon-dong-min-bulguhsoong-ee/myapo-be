import {applyDecorators} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import {ApiCommonRes} from '../../common/api-common-res.decorator';
import {AdvanceDocumentStageRes} from '../res/advance-document-stage.res';
import {ApproveDocumentRes} from '../res/approve-document.res';
import {CreateDocumentRes} from '../res/create-document.res';
import {DocumentDetailRes} from '../res/document-detail.res';
import {DocumentListRes} from '../res/document-list.res';

/**
 * 컨트롤러 비즈니스 데코레이터를 한 곳에 모아서 컨트롤러 본문을 얇게 유지한다.
 * 새 엔드포인트가 생기면 여기에 X<XSwaggerApi>() 형태로 추가.
 *
 * 인증: 모든 엔드포인트는 JwtAuthGuard 로 보호 — `Authorization: Bearer <token>` 필수.
 * (X-User-Id 헤더는 가드 미통과 시의 fallback 으로만 동작 — 일반 사용 X.)
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
                '*인증*: `Authorization: Bearer <accessToken>` 필수 (JwtAuthGuard).',
        }),
        ApiBearerAuth(),
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
                '*인증*: `Authorization: Bearer <accessToken>` 필수.',
        }),
        ApiBearerAuth(),
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
                '*인증*: `Authorization: Bearer <accessToken>` 필수.',
        }),
        ApiBearerAuth(),
        ApiCommonRes(AdvanceDocumentStageRes),
    );

export const ListDocumentSwaggerApi = (): MethodDecorator =>
    applyDecorators(
        ApiOperation({
            summary: '문서 관리 리스트 조회 (와이어프레임 console.html 의 docs 8컬럼)',
            description:
                '문서 관리 페이지의 리스트 뷰를 위한 페이지네이션 조회. ' +
                '컬럼: 요청번호 / 회원번호 / 요청자 / 이메일 / 문서 유형 / 국가 / 요청 시각 / 상태.\n\n' +
                '필터 (모두 optional, 미지정 = 전체):\n' +
                '- `status` (DocumentStatus) — 와이어프레임 탭(progress/valid/expired/revoked/failed) 1:1 대응\n' +
                '- `documentTypeCode` — 문서 카탈로그 코드\n' +
                '- `countryCode` — 발급기관 국가 (ISO 3166-1 alpha-2)\n' +
                '- `q` — documentCode / 요청자 이름 / 이메일 부분일치 (대소문자 무시)\n\n' +
                '정렬은 `requestedAt DESC` 고정. ' +
                '*콘솔 운영자 뷰* 라서 본인 소유 필터링은 적용하지 않는다.\n\n' +
                '*인증*: `Authorization: Bearer <accessToken>` 필수.',
        }),
        ApiBearerAuth(),
        ApiCommonRes(DocumentListRes),
    );

export const GetDocumentDetailSwaggerApi = (): MethodDecorator =>
    applyDecorators(
        ApiOperation({
            summary: '문서 상세 조회 (행 펼침 — 5단계 파이프라인 + 사용자 승인 누적)',
            description:
                '문서 관리 리스트 행을 클릭했을 때 펼침 영역에 표시할 상세.\n\n' +
                '리턴되는 핵심 필드:\n' +
                '- `currentStage` — 현재 stage (5단계 중 어디인지)\n' +
                '- `currentSubstep` — 진행 중인 sub-step ' +
                '(`CREDENTIAL_GENERATING` / `AWAITING_USER_APPROVAL` / null)\n' +
                '- `stages[]` — 5개 stage 의 이벤트 스냅샷 (`status: null` = 미시작)\n' +
                '- `approvals[]` — 사용자가 서명한 DocumentApproval 누적 ' +
                '(stage = "이 승인이 통과시킨 다음 stage")\n\n' +
                '클라이언트는 `approvals` 에 stage=X 가 있으면 ' +
                '"X 단계로의 사용자 승인이 완료" 로, ' +
                '`stages[i].status` 가 채워져 있으면 "i 단계 크리덴셜 이벤트가 시작/진행/완료/실패" 로 ' +
                '와이어프레임 substep 표시(✓ / 진행 중 / 미진행) 매핑하면 된다.\n\n' +
                '*인증*: `Authorization: Bearer <accessToken>` 필수.',
        }),
        ApiParam({
            name: 'documentCode',
            description: '발급 문서 외부 노출 코드 (UUID).',
            example: '9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        }),
        ApiBearerAuth(),
        ApiCommonRes(DocumentDetailRes),
    );
