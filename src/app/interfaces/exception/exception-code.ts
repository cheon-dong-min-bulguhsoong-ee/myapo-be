import {HttpStatus} from '@nestjs/common';

export interface ExceptionCode {
    readonly httpStatus: HttpStatus;
    readonly code: string;
    readonly message: string;
}

const define = (
    name: string,
    httpStatus: HttpStatus,
    message: string,
): ExceptionCode => ({
    httpStatus,
    code: `ERR_${name}`,
    message,
});

export const ExceptionCode = {
    Common: {
        NOT_FOUND: define('NOT_FOUND', HttpStatus.NOT_FOUND, '찾을 수 없습니다.'),
        BAD_REQUEST: define('BAD_REQUEST', HttpStatus.BAD_REQUEST, '잘못된 요청입니다.'),
        INTERNAL_SERVER_ERROR: define(
            'INTERNAL_SERVER_ERROR',
            HttpStatus.INTERNAL_SERVER_ERROR,
            '서버에 문제가 발생했습니다.',
        ),
        VALIDATION_ERROR: define(
            'VALIDATION_ERROR',
            HttpStatus.BAD_REQUEST,
            '입력값 검증에 실패했습니다.',
        ),
        INVALID_REQUEST_BODY: define(
            'INVALID_REQUEST_BODY',
            HttpStatus.BAD_REQUEST,
            '요청 본문이 올바르지 않습니다.',
        ),
    },
    User: {
        USER_NOT_FOUND: define(
            'USER_NOT_FOUND',
            HttpStatus.NOT_FOUND,
            '사용자를 찾을 수 없습니다.',
        ),
        USER_NOT_ACTIVE: define(
            'USER_NOT_ACTIVE',
            HttpStatus.FORBIDDEN,
            '사용자가 활성 상태가 아닙니다.',
        ),
    },
    MyData: {
        SNAPSHOT_MISSING: define(
            'MYDATA_SNAPSHOT_MISSING',
            HttpStatus.UNPROCESSABLE_ENTITY,
            '필요한 마이데이터 카테고리가 누락되었습니다.',
        ),
    },
    Issuer: {
        INVALID_CREDENTIALS: define(
            'INVALID_CREDENTIALS',
            HttpStatus.UNAUTHORIZED,
            '아이디 또는 비밀번호가 올바르지 않습니다.',
        ),
        ALREADY_REGISTERED: define(
            'ISSUER_ALREADY_REGISTERED',
            HttpStatus.CONFLICT,
            '이미 등록된 발급 기관입니다.',
        ),
        ADMIN_ID_TAKEN: define(
            'ISSUER_ADMIN_ID_TAKEN',
            HttpStatus.CONFLICT,
            '이미 사용 중인 담당자 ID 입니다.',
        ),
        INACTIVE: define(
            'ISSUER_INACTIVE',
            HttpStatus.FORBIDDEN,
            '비활성 발급 기관 계정입니다.',
        ),
        CREDENTIAL_ISSUANCE_FAILED: define(
            'CREDENTIAL_ISSUANCE_FAILED',
            HttpStatus.BAD_GATEWAY,
            'Credential 발행에 실패했습니다.',
        ),
        CREDENTIAL_KYC_REQUIRED: define(
            'CREDENTIAL_KYC_REQUIRED',
            HttpStatus.BAD_REQUEST,
            'KYC(TOSS_ARC) 발급은 필수입니다. 발급 출처에 TOSS_ARC 를 포함해주세요.',
        ),
        CREDENTIAL_REQUEST_NOT_FOUND: define(
            'CREDENTIAL_REQUEST_NOT_FOUND',
            HttpStatus.NOT_FOUND,
            '해당 발급 요청을 찾을 수 없습니다.',
        ),
        INVALID_REQUEST_CODE: define(
            'INVALID_REQUEST_CODE',
            HttpStatus.BAD_REQUEST,
            '발급 요청 ID 형식이 올바르지 않습니다 (양의 정수).',
        ),
        UNAUTHORIZED: define(
            'ISSUER_UNAUTHORIZED',
            HttpStatus.UNAUTHORIZED,
            '발급자 콘솔 인증이 필요합니다.',
        ),
    },
    Compliance: {
        FREEZE_FAILED: define(
            'COMPLIANCE_FREEZE_FAILED',
            HttpStatus.BAD_GATEWAY,
            'Deep Freeze 트랜잭션 처리에 실패했습니다.',
        ),
    },
    Gateway: {
        ADMISSION_DENIED: define(
            'ADMISSION_DENIED',
            HttpStatus.FORBIDDEN,
            '도메인 입장 자격이 부족합니다.',
        ),
    },
} as const;
