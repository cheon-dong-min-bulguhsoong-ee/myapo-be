import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStatus} from '../enum/document-status.enum';

/**
 * 문서 관리 페이지의 리스트 1행 — 와이어프레임 console.html `DOC_TABS` 컬럼 정의를 그대로 따른다.
 *
 * 8개 컬럼: 요청번호 / 회원번호 / 요청자 / 이메일 / 문서유형 / 국가 / 요청 시각 / 상태
 *
 * `memberCode` 는 user.id 의 문자열 표현 (BIGSERIAL 노출 정책 위반이지만, 콘솔용 내부 식별자로
 * 운영자에게 필요). 외부 사용자 응답에는 쓰지 않는다.
 */
export class DocumentListItemResult {
    constructor(
        public readonly documentCode: string,
        public readonly memberCode: string,
        public readonly requesterName: string,
        public readonly requesterEmail: string,
        public readonly documentTypeCode: string,
        public readonly documentTypeName: string,
        public readonly countryCode: string,
        public readonly requestedAt: Date,
        public readonly status: DocumentStatus,
        public readonly currentStage: DocumentStage,
    ) {
    }
}

/**
 * 페이지네이션 wrapper.
 */
export class DocumentListResult {
    constructor(
        public readonly items: DocumentListItemResult[],
        public readonly total: number,
        public readonly page: number,
        public readonly limit: number,
    ) {
    }
}
