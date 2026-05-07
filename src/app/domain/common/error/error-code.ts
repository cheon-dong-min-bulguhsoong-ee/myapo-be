/**
 * 도메인이 던질 수 있는 모든 에러의 카탈로그 (값 객체).
 *
 * - 인터페이스(@nestjs/common · HttpException 등) 무관 — 순수 메타데이터.
 * - httpStatus 는 RFC 7231 숫자 코드 (NestJS HttpStatus enum 값과 동일).
 * - code prefix 'ERR_' 자동 부착 — 클라이언트 응답 본문의 안정 식별자.
 *
 * 새 에러 추가 시:
 *   1) 적절한 그룹 (User / Document / Auth / Common) 에 한 줄 추가
 *   2) 도메인 서비스에서 `throw new DomainError(ErrorCode.X.Y, data)` 하면 끝
 *   3) handler 손댈 필요 없음
 */

export interface ErrorCode {
    readonly code: string;
    readonly httpStatus: number;
    readonly message: string;
}

const define = (
    name: string,
    httpStatus: number,
    message: string,
): ErrorCode => ({
    httpStatus,
    code: `ERR_${name}`,
    message,
});

export const ErrorCode = {
    Common: {
        NOT_FOUND: define('NOT_FOUND', 404, '찾을 수 없습니다.'),
        BAD_REQUEST: define('BAD_REQUEST', 400, '잘못된 요청입니다.'),
        INTERNAL_SERVER_ERROR: define(
            'INTERNAL_SERVER_ERROR',
            500,
            '서버에 문제가 발생했습니다.',
        ),
        VALIDATION_ERROR: define(
            'VALIDATION_ERROR',
            400,
            '입력값 검증에 실패했습니다.',
        ),
    },
    Auth: {
        USER_HEADER_MISSING: define(
            'AUTH_USER_HEADER_MISSING',
            401,
            'X-User-Id 헤더가 필요합니다.',
        ),
        USER_HEADER_INVALID: define(
            'AUTH_USER_HEADER_INVALID',
            400,
            'X-User-Id 헤더 형식이 올바르지 않습니다 (양의 정수).',
        ),
    },
    User: {
        USER_NOT_FOUND: define(
            'USER_NOT_FOUND',
            404,
            '사용자를 찾을 수 없습니다.',
        ),
        USER_NOT_ACTIVE: define(
            'USER_NOT_ACTIVE',
            403,
            '사용자가 활성 상태가 아닙니다.',
        ),
    },
    Document: {
        TYPE_NOT_FOUND: define(
            'DOCUMENT_TYPE_NOT_FOUND',
            404,
            '해당 문서 종류를 찾을 수 없거나 더 이상 신청할 수 없습니다.',
        ),
        PERSONA_MISMATCH: define(
            'DOCUMENT_PERSONA_MISMATCH',
            403,
            '회원의 페르소나에서 신청할 수 없는 문서입니다.',
        ),
        NOT_FOUND: define(
            'DOCUMENT_NOT_FOUND',
            404,
            '해당 문서를 찾을 수 없습니다.',
        ),
        NOT_OWNED: define(
            'DOCUMENT_NOT_OWNED',
            403,
            '본인이 신청한 문서가 아닙니다.',
        ),
        ALREADY_FINAL_STAGE: define(
            'DOCUMENT_ALREADY_FINAL_STAGE',
            409,
            '이미 마지막 단계에 도달한 문서입니다.',
        ),
        STAGE_ALREADY_APPROVED: define(
            'DOCUMENT_STAGE_ALREADY_APPROVED',
            409,
            '해당 단계는 이미 승인되었습니다.',
        ),
    },
} as const;
