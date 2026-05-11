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
    NOT_FOUND: define("NOT_FOUND", 404, "찾을 수 없습니다."),
    BAD_REQUEST: define("BAD_REQUEST", 400, "잘못된 요청입니다."),
    INTERNAL_SERVER_ERROR: define(
      "INTERNAL_SERVER_ERROR",
      500,
      "서버에 문제가 발생했습니다.",
    ),
    VALIDATION_ERROR: define(
      "VALIDATION_ERROR",
      400,
      "입력값 검증에 실패했습니다.",
    ),
    FORBIDDEN: define("FORBIDDEN", 403, "권한이 없습니다."),
  },
  Auth: {
    USER_HEADER_MISSING: define(
      "AUTH_USER_HEADER_MISSING",
      401,
      "X-User-Id 헤더가 필요합니다.",
    ),
    USER_HEADER_INVALID: define(
      "AUTH_USER_HEADER_INVALID",
      400,
      "X-User-Id 헤더 형식이 올바르지 않습니다 (양의 정수).",
    ),
    TOKEN_EXPIRED: define("AUTH_TOKEN_EXPIRED", 401, "토큰이 만료되었습니다."),
    TOKEN_INVALID: define(
      "AUTH_TOKEN_INVALID",
      401,
      "유효하지 않은 토큰입니다.",
    ),
    UNAUTHORIZED: define("AUTH_UNAUTHORIZED", 401, "인증되지 않은 요청입니다."),
  },
  User: {
    USER_NOT_FOUND: define("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."),
    EMAIL_DUPLICATED: define(
      "USER_EMAIL_DUPLICATED",
      409,
      "이미 사용 중인 이메일입니다.",
    ),
    WALLET_DUPLICATED: define(
      "USER_WALLET_DUPLICATED",
      409,
      "이미 등록된 지갑 주소입니다.",
    ),
    VERIFIER_DUPLICATED: define(
      "USER_VERIFIER_DUPLICATED",
      409,
      "이미 해당 소셜 계정으로 연결된 사용자가 존재합니다.",
    ),
    REACTIVATION_BLOCKED: define(
      "USER_REACTIVATION_BLOCKED",
      403,
      "계정 복구 중 지갑 주소가 일치하지 않아 차단되었습니다.",
    ),
    INVALID_NATIONALITY: define(
      "USER_INVALID_NATIONALITY",
      400,
      "올바르지 않은 국적 코드입니다.",
    ),
  },
  Credential: {
    DOCUMENT_TYPE_NOT_FOUND: define(
      "CREDENTIAL_DOCUMENT_TYPE_NOT_FOUND",
      404,
      "해당 크리덴셜 문서 종류를 찾을 수 없거나 신청할 수 없습니다.",
    ),
    ISSUE_REQUEST_NOT_FOUND: define(
      "CREDENTIAL_ISSUE_REQUEST_NOT_FOUND",
      404,
      "해당 크리덴셜 발급 요청을 찾을 수 없습니다.",
    ),
    NOT_FOUND: define(
      "CREDENTIAL_NOT_FOUND",
      404,
      "해당 크리덴셜을 찾을 수 없습니다.",
    ),
    NOT_OWNED: define(
      "CREDENTIAL_NOT_OWNED",
      403,
      "본인의 크리덴셜이 아닙니다.",
    ),
    CONSENT_REQUIRED: define(
      "CREDENTIAL_CONSENT_REQUIRED",
      400,
      "기관 제출 동의가 필요합니다.",
    ),
    EXPIRED: define("CREDENTIAL_EXPIRED", 409, "만료된 크리덴셜입니다."),
    REVOKED: define("CREDENTIAL_REVOKED", 409, "폐기된 크리덴셜입니다."),
    NOT_SUBMITTABLE: define(
      "CREDENTIAL_NOT_SUBMITTABLE",
      409,
      "제출할 수 없는 상태의 크리덴셜입니다.",
    ),
    SUBMISSION_DUPLICATED: define(
      "CREDENTIAL_SUBMISSION_DUPLICATED",
      409,
      "이미 제출된 기관 요청입니다.",
    ),
    XRPL_ACCOUNT_INVALID: define(
      "CREDENTIAL_XRPL_ACCOUNT_INVALID",
      400,
      "XRPL 계정 주소 형식이 올바르지 않습니다.",
    ),
    XRPL_CREDENTIAL_TYPE_INVALID: define(
      "CREDENTIAL_XRPL_CREDENTIAL_TYPE_INVALID",
      400,
      "XRPL CredentialType 형식이 올바르지 않습니다.",
    ),
    XRPL_URI_INVALID: define(
      "CREDENTIAL_XRPL_URI_INVALID",
      400,
      "XRPL URI 형식이 올바르지 않습니다.",
    ),
    XRPL_UINT32_INVALID: define(
      "CREDENTIAL_XRPL_UINT32_INVALID",
      400,
      "XRPL UInt32 값 형식이 올바르지 않습니다.",
    ),
    XRPL_CREDENTIAL_DELETE_TARGET_REQUIRED: define(
      "CREDENTIAL_XRPL_DELETE_TARGET_REQUIRED",
      400,
      "XRPL CredentialDelete에는 Subject 또는 Issuer가 필요합니다.",
    ),
    XRPL_CONFIG_MISSING: define(
      "CREDENTIAL_XRPL_CONFIG_MISSING",
      500,
      "XRPL Testnet 설정이 누락되었습니다.",
    ),
    XRPL_EVIDENCE_REQUIRED: define(
      "CREDENTIAL_XRPL_EVIDENCE_REQUIRED",
      409,
      "XRPL Testnet 증적이 있는 크리덴셜에서만 수행할 수 있습니다.",
    ),
    XRPL_TESTNET_PUBLISH_FAILED: define(
      "CREDENTIAL_XRPL_TESTNET_PUBLISH_FAILED",
      502,
      "XRPL Testnet 트랜잭션 제출에 실패했습니다.",
    ),
  },
  Document: {
    TYPE_NOT_FOUND: define(
      "DOCUMENT_TYPE_NOT_FOUND",
      404,
      "해당 문서 종류를 찾을 수 없거나 더 이상 신청할 수 없습니다.",
    ),
    PERSONA_MISMATCH: define(
      "DOCUMENT_PERSONA_MISMATCH",
      403,
      "회원의 페르소나에서 신청할 수 없는 문서입니다.",
    ),
    NOT_FOUND: define(
      "DOCUMENT_NOT_FOUND",
      404,
      "해당 문서를 찾을 수 없습니다.",
    ),
    NOT_OWNED: define(
      "DOCUMENT_NOT_OWNED",
      403,
      "본인이 신청한 문서가 아닙니다.",
    ),
    ALREADY_FINAL_STAGE: define(
      "DOCUMENT_ALREADY_FINAL_STAGE",
      409,
      "이미 마지막 단계에 도달한 문서입니다.",
    ),
    STAGE_ALREADY_APPROVED: define(
      "DOCUMENT_STAGE_ALREADY_APPROVED",
      409,
      "해당 단계는 이미 승인되었습니다.",
    ),
    FILE_REQUIRED: define(
      "DOCUMENT_FILE_REQUIRED",
      400,
      "업로드할 파일이 필요합니다.",
    ),
    FILE_TOO_LARGE: define(
      "DOCUMENT_FILE_TOO_LARGE",
      413,
      "허용된 최대 파일 크기를 초과했습니다.",
    ),
    FILE_NOT_PDF: define(
      "DOCUMENT_FILE_NOT_PDF",
      400,
      "PDF 파일만 암호화 업로드할 수 있습니다.",
    ),
    FILE_PASSWORD_REQUIRED: define(
      "DOCUMENT_FILE_PASSWORD_REQUIRED",
      400,
      "PDF 보호 비밀번호가 필요합니다.",
    ),
    FILE_NOT_FOUND: define(
      "DOCUMENT_FILE_NOT_FOUND",
      404,
      "해당 파일을 찾을 수 없습니다.",
    ),
    FILE_STORAGE_FAILURE: define(
      "DOCUMENT_FILE_STORAGE_FAILURE",
      502,
      "파일 저장소와의 통신 중 오류가 발생했습니다.",
    ),
    FILE_ENCRYPTION_FAILURE: define(
      "DOCUMENT_FILE_ENCRYPTION_FAILURE",
      500,
      "PDF 암호화 처리 중 오류가 발생했습니다.",
    ),
  },
} as const;
