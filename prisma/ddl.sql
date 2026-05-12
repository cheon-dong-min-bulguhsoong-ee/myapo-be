-- ═══════════════════════════════════════════════════════════════════════════
-- MyApo DDL — Prisma schema (tosalpee) 기준 전체 재생성 스크립트
--
-- 실행 효과:
--   1) tosalpee 스키마의 모든 테이블 DROP (FK 역순)
--   2) 테이블 / 인덱스 / FK 신규 생성 (의존성 순)
--   3) 한국어 COMMENT 부착 (테이블 + 컬럼)
--
-- 주의:
--   - 외부 공유 DB 정책상 운영에서는 사용 금지. 로컬 / 개발 환경 전용.
--   - 데이터가 모두 사라진다.
--
-- 적용:
--   psql "$DATABASE_URL" -f prisma/ddl.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS tosalpee;

-- ───────────────────────────────────────────────────────────────────────────
-- DROP (FK 역순)
-- ───────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS tosalpee.dispute_timeline    CASCADE;
DROP TABLE IF EXISTS tosalpee.disputes            CASCADE;
DROP TABLE IF EXISTS tosalpee.credential_xrpl_transactions CASCADE;
DROP TABLE IF EXISTS tosalpee.credential_submissions  CASCADE;
DROP TABLE IF EXISTS tosalpee.credentials             CASCADE;
DROP TABLE IF EXISTS tosalpee.credential_issue_requests CASCADE;
DROP TABLE IF EXISTS tosalpee.document_stages    CASCADE;
DROP TABLE IF EXISTS tosalpee.document_approvals CASCADE;
DROP TABLE IF EXISTS tosalpee.documents          CASCADE;
DROP TABLE IF EXISTS tosalpee.document_types     CASCADE;
DROP TABLE IF EXISTS tosalpee.issuers            CASCADE;
DROP TABLE IF EXISTS tosalpee.user_wallets       CASCADE;
DROP TABLE IF EXISTS tosalpee.users              CASCADE;


-- ═══════════════════════════════════════════════════════════════════════════
-- 1) users — 웹/앱 로그인 사용자
--    Web3Auth Login Provider(GOOGLE | KAKAO | LINE | NAVER) 기준 신원 1행.
--    지갑은 self-custodial — 사용자 디바이스에서 seed 생성/보관, 서버는 주소·검증 정보만.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.users (
                                id            BIGSERIAL PRIMARY KEY,
                                email         VARCHAR(255)  NOT NULL,
                                name          VARCHAR(50)   NOT NULL,
                                nationality   VARCHAR(2)    NOT NULL,
                                role          VARCHAR(20)   NOT NULL DEFAULT 'USER',
                                last_login_at TIMESTAMPTZ(0),
                                created_at    TIMESTAMPTZ(0) NOT NULL DEFAULT now(),
                                updated_at    TIMESTAMPTZ(0) NOT NULL DEFAULT now(),
                                is_delete     BOOLEAN       NOT NULL DEFAULT false,

                                CONSTRAINT users_email_unique UNIQUE (email)
);

COMMENT ON TABLE  tosalpee.users               IS '웹/앱 로그인 사용자 마스터. Web3Auth 인증 ID 와 1:1 매칭.';
COMMENT ON COLUMN tosalpee.users.id            IS '사용자 PK (BIGSERIAL). 외부에는 노출 금지.';
COMMENT ON COLUMN tosalpee.users.email         IS '로그인 이메일. 활성 계정 기준 UNIQUE.';
COMMENT ON COLUMN tosalpee.users.name          IS '표시 이름.';
COMMENT ON COLUMN tosalpee.users.nationality   IS '국적 (ISO 3166-1 alpha-2 / 2자리 영대문자). 페르소나 결정에 사용 — KR=KOREAN, 그 외=FOREIGNER.';
COMMENT ON COLUMN tosalpee.users.last_login_at IS '마지막 로그인 시각 (TZ 포함).';
COMMENT ON COLUMN tosalpee.users.created_at    IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.users.updated_at    IS '레코드 갱신 시각 (Prisma @updatedAt 으로 어플리케이션이 자동 갱신).';
COMMENT ON COLUMN tosalpee.users.is_delete     IS 'Soft-delete 플래그. true 면 탈퇴 — 복구 시 false 로 되돌림.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 2) user_wallets — 사용자 지갑 (1:1, self-custodial)
--    소셜 계정(verifier+verifier_id) 1쌍이 한 사용자에게만 연결되도록 강제.
--    XRPL 주소는 전역 UNIQUE — 같은 지갑이 여러 사용자에 연결되는 것 차단.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.user_wallets (
                                       id           BIGSERIAL PRIMARY KEY,
                                       user_id      BIGINT        NOT NULL,
                                       verifier     VARCHAR(20)   NOT NULL,
                                       verifier_id  VARCHAR(255)  NOT NULL,
                                       xrpl_address VARCHAR(35)   NOT NULL,
                                       public_key   VARCHAR(66)   NOT NULL,
                                       requested_at TIMESTAMPTZ(0) NOT NULL DEFAULT now(),
                                       activated_at TIMESTAMPTZ(0) NOT NULL DEFAULT now(),
                                       updated_at   TIMESTAMPTZ(0) NOT NULL DEFAULT now(),

                                       CONSTRAINT user_wallets_user_id_unique    UNIQUE (user_id),
                                       CONSTRAINT user_wallets_xrpl_addr_unique  UNIQUE (xrpl_address),
                                       CONSTRAINT user_wallets_user_fk           FOREIGN KEY (user_id)
                                           REFERENCES tosalpee.users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_wallets_verifier_composite
    ON tosalpee.user_wallets (verifier, verifier_id);
CREATE INDEX idx_user_wallets_xrpl_address
    ON tosalpee.user_wallets (xrpl_address);

COMMENT ON TABLE  tosalpee.user_wallets               IS '사용자 지갑 (1 user : 1 wallet). XRPL 주소와 Web3Auth 식별자를 함께 보관.';
COMMENT ON COLUMN tosalpee.user_wallets.id            IS '지갑 레코드 PK.';
COMMENT ON COLUMN tosalpee.user_wallets.user_id       IS '소유 사용자 FK. user_id UNIQUE 로 1:1 강제.';
COMMENT ON COLUMN tosalpee.user_wallets.verifier      IS 'Web3Auth login provider 식별자 (google | kakao | line | naver 등).';
COMMENT ON COLUMN tosalpee.user_wallets.verifier_id   IS 'Web3Auth 가 발급하는 사용자 고유 식별자(sub). 같은 verifier 에서 변경되지 않음.';
COMMENT ON COLUMN tosalpee.user_wallets.xrpl_address  IS 'XRPL 지갑 주소 (r 로 시작, 25~35자). 전역 UNIQUE.';
COMMENT ON COLUMN tosalpee.user_wallets.public_key    IS 'XRPL 공개키 (hex 66자). 서버사이드 서명 검증용.';
COMMENT ON COLUMN tosalpee.user_wallets.requested_at  IS '지갑 등록 요청 시각.';
COMMENT ON COLUMN tosalpee.user_wallets.activated_at  IS '지갑 활성화(검증 완료) 시각.';
COMMENT ON COLUMN tosalpee.user_wallets.updated_at    IS '레코드 갱신 시각 — 상태 변경 추적 / 보안 감사용.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 3) issuers — 발급기관 마스터
--    KR-NTS(국세청) · KR-MOJ(법무부) · VN-MOFA(베트남 외교부) 등.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.issuers (
                                  code           VARCHAR(20)  PRIMARY KEY,
                                  name           VARCHAR(50)  NOT NULL,
                                  country_code   VARCHAR(2)   NOT NULL,
                                  icon_label     VARCHAR(20)  NOT NULL,
                                  wallet_address VARCHAR(35),
                                  status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
                                  created_at     TIMESTAMP(0) NOT NULL DEFAULT now(),
                                  updated_at     TIMESTAMP(0) NOT NULL DEFAULT now(),
                                  is_delete      BOOLEAN      NOT NULL DEFAULT false,

                                  CONSTRAINT issuers_wallet_addr_unique UNIQUE (wallet_address)
);

CREATE INDEX idx_issuers_country_status ON tosalpee.issuers (country_code, status);

COMMENT ON TABLE  tosalpee.issuers                IS '문서 발급기관 마스터. 문서 종류(document_types) 의 issuer_code 가 이 코드를 참조.';
COMMENT ON COLUMN tosalpee.issuers.code           IS '기관 식별 코드 (PK). 형식 예: "KR-NTS", "VN-MOFA".';
COMMENT ON COLUMN tosalpee.issuers.name           IS '기관 명 (현지어).';
COMMENT ON COLUMN tosalpee.issuers.country_code   IS '국가 코드 (ISO 3166-1 alpha-2).';
COMMENT ON COLUMN tosalpee.issuers.icon_label     IS '클라이언트 아이콘 매핑 라벨 (예: "NTS", "MOFA").';
COMMENT ON COLUMN tosalpee.issuers.wallet_address IS '기관의 XRPL 지갑 주소(있는 경우). 전역 UNIQUE — 같은 지갑 두 기관 사용 차단.';
COMMENT ON COLUMN tosalpee.issuers.status         IS '기관 운영 상태 (ACTIVE | INACTIVE 등).';
COMMENT ON COLUMN tosalpee.issuers.created_at     IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.issuers.updated_at     IS '레코드 갱신 시각.';
COMMENT ON COLUMN tosalpee.issuers.is_delete      IS 'Soft-delete 플래그.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 4) document_types — 문서 카탈로그
--    발급 신청 시 사용자에게 노출되는 문서 종류 마스터.
--    persona_type 으로 신청 가능 사용자 풀(KOREAN/FOREIGNER) 을 구분.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.document_types (
                                         code               VARCHAR(40)  PRIMARY KEY,
                                         name               VARCHAR(100) NOT NULL,
                                         english_name       VARCHAR(100),
                                         issuer_code        VARCHAR(20)  NOT NULL,
                                         persona_type       VARCHAR(20)  NOT NULL,
                                         use_case           VARCHAR(200),
                                         default_ttl_months INT          NOT NULL DEFAULT 6,
                                         status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
                                         created_at         TIMESTAMP(0) NOT NULL DEFAULT now(),
                                         updated_at         TIMESTAMP(0) NOT NULL DEFAULT now(),
                                         is_delete          BOOLEAN      NOT NULL DEFAULT false,

                                         CONSTRAINT document_types_issuer_fk FOREIGN KEY (issuer_code)
                                             REFERENCES tosalpee.issuers (code)
);

CREATE INDEX idx_document_types_persona_status ON tosalpee.document_types (persona_type, status);
CREATE INDEX idx_document_types_issuer         ON tosalpee.document_types (issuer_code);

COMMENT ON TABLE  tosalpee.document_types                    IS '발급 가능한 문서 종류 카탈로그. 와이어프레임 A-01 의 문서 카드 그리드 소스.';
COMMENT ON COLUMN tosalpee.document_types.code               IS '카탈로그 코드 (PK). 형식 예: "KR-NTS-TAX-PAYMENT".';
COMMENT ON COLUMN tosalpee.document_types.name               IS '문서명 (한글).';
COMMENT ON COLUMN tosalpee.document_types.english_name       IS '문서명 (영문).';
COMMENT ON COLUMN tosalpee.document_types.issuer_code        IS '발급기관 코드 — issuers(code) 참조.';
COMMENT ON COLUMN tosalpee.document_types.persona_type       IS '신청 가능 페르소나 (KOREAN | FOREIGNER). 사용자 nationality 와 일치해야 신청 가능.';
COMMENT ON COLUMN tosalpee.document_types.use_case           IS '활용 시나리오 안내 문구 (UI 부가 설명).';
COMMENT ON COLUMN tosalpee.document_types.default_ttl_months IS '발급 후 기본 유효 기간(개월). documents.expires_at 산출 베이스.';
COMMENT ON COLUMN tosalpee.document_types.status             IS '카탈로그 노출 상태 (ACTIVE | INACTIVE). INACTIVE 면 신청 불가.';
COMMENT ON COLUMN tosalpee.document_types.created_at         IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.document_types.updated_at         IS '레코드 갱신 시각.';
COMMENT ON COLUMN tosalpee.document_types.is_delete          IS 'Soft-delete 플래그.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 5) documents — 발급된 문서 (마스터)
--    5-stage 파이프라인의 현재 포인터(current_stage) 와 종합 status 를 보관.
--
--    Stage 흐름:
--      AUTHORITY_ISSUED → DOCUMENT_ARRIVED → TRANSLATED_NOTARIZED
--                       → APOSTILLE_ISSUED → WALLET_STORED
--      각 전이마다 사용자 서명 1회 — 총 4건의 document_approvals 누적.
--      WALLET_STORED 도달 시 status=VALID.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.documents (
                                    id                  BIGSERIAL PRIMARY KEY,
                                    document_code       UUID          NOT NULL,
                                    user_id             BIGINT        NOT NULL,
                                    document_type_code  VARCHAR(40)   NOT NULL,
                                    status              VARCHAR(40)   NOT NULL DEFAULT 'PROGRESS',
                                    current_stage       VARCHAR(40)   NOT NULL DEFAULT 'RECEIVED',
                                    failure_reason      TEXT,
                                    xrpl_create_tx_hash CHAR(64),
                                    xrpl_ledger_index   BIGINT,
                                    payload_hash        CHAR(64),
                                    requested_at        TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                    issued_at           TIMESTAMP(0),
                                    expires_at          TIMESTAMP(0),
                                    revoked_at          TIMESTAMP(0),
                                    created_at          TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                    updated_at          TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                    is_delete           BOOLEAN       NOT NULL DEFAULT false,

                                    CONSTRAINT documents_code_unique     UNIQUE (document_code),
                                    CONSTRAINT documents_user_fk         FOREIGN KEY (user_id)
                                        REFERENCES tosalpee.users (id),
                                    CONSTRAINT documents_doctype_fk      FOREIGN KEY (document_type_code)
                                        REFERENCES tosalpee.document_types (code)
);

CREATE INDEX idx_documents_user_time     ON tosalpee.documents (user_id, requested_at DESC);
CREATE INDEX idx_documents_status_time   ON tosalpee.documents (status, requested_at DESC);
CREATE INDEX idx_documents_stage_status  ON tosalpee.documents (current_stage, status);
CREATE INDEX idx_documents_expires_at    ON tosalpee.documents (expires_at);

COMMENT ON TABLE  tosalpee.documents                     IS '발급된 문서 1건 = 1행. current_stage / status 가 5-stage 파이프라인의 진행 포인터 역할.';
COMMENT ON COLUMN tosalpee.documents.id                  IS '문서 PK (BIGSERIAL). 외부 노출 금지.';
COMMENT ON COLUMN tosalpee.documents.document_code       IS '외부 노출용 식별자 (UUID). 클라이언트는 이 코드로 상세조회·SSE 구독.';
COMMENT ON COLUMN tosalpee.documents.user_id             IS '신청자 FK — users(id).';
COMMENT ON COLUMN tosalpee.documents.document_type_code  IS '문서 카탈로그 코드 — document_types(code).';
COMMENT ON COLUMN tosalpee.documents.status              IS '종합 상태 (PROGRESS | AWAITING_APPROVAL | VALID | EXPIRED | REVOKED | FAILED). WALLET_STORED 도달 시 VALID.';
COMMENT ON COLUMN tosalpee.documents.current_stage       IS '5-stage 파이프라인 현재 위치 (AUTHORITY_ISSUED | DOCUMENT_ARRIVED | TRANSLATED_NOTARIZED | APOSTILLE_ISSUED | WALLET_STORED).';
COMMENT ON COLUMN tosalpee.documents.failure_reason      IS '실패 시 사유 메시지. status=FAILED 일 때만 의미.';
COMMENT ON COLUMN tosalpee.documents.xrpl_create_tx_hash IS '문서 생성 시 XRPL 트랜잭션 해시 (issuer 의 CredentialCreate 등). hex 64자.';
COMMENT ON COLUMN tosalpee.documents.xrpl_ledger_index   IS 'XRPL ledger index — 트랜잭션이 포함된 ledger 번호.';
COMMENT ON COLUMN tosalpee.documents.payload_hash        IS '문서 원본 payload 해시 (위변조 검증용). hex 64자.';
COMMENT ON COLUMN tosalpee.documents.requested_at        IS '발급 신청 시각.';
COMMENT ON COLUMN tosalpee.documents.issued_at           IS '발급 완료(WALLET_STORED 도달) 시각. 이전엔 NULL.';
COMMENT ON COLUMN tosalpee.documents.expires_at          IS '만료 시각. issued_at + document_types.default_ttl_months 기준 산출.';
COMMENT ON COLUMN tosalpee.documents.revoked_at          IS '폐기 시각 (REVOKED 상태 진입 시).';
COMMENT ON COLUMN tosalpee.documents.created_at          IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.documents.updated_at          IS '레코드 갱신 시각.';
COMMENT ON COLUMN tosalpee.documents.is_delete           IS 'Soft-delete 플래그.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 6) document_approvals — 사용자 승인 이벤트 (1 문서 : N 행, 최대 4건)
--    각 stage 전이 직전 사용자가 자기 seed 로 서명한 XRPL TX 를 1행으로 보관.
--    stage = "이 승인이 통과시킨 다음 stage" — 같은 stage 중복 승인은 UNIQUE 로 차단.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.document_approvals (
                                             id           BIGSERIAL PRIMARY KEY,
                                             document_id  BIGINT        NOT NULL,
                                             stage        VARCHAR(40)   NOT NULL,
                                             xrpl_tx_hash CHAR(64)      NOT NULL,
                                             approved_at  TIMESTAMP(0)  NOT NULL,
                                             created_at   TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                             updated_at   TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                             is_delete    BOOLEAN       NOT NULL DEFAULT false,

                                             CONSTRAINT document_approvals_document_fk FOREIGN KEY (document_id)
                                                 REFERENCES tosalpee.documents (id)
);

CREATE UNIQUE INDEX uniq_document_approvals_doc_stage
    ON tosalpee.document_approvals (document_id, stage);
CREATE INDEX idx_document_approvals_doc_time
    ON tosalpee.document_approvals (document_id, approved_at);

COMMENT ON TABLE  tosalpee.document_approvals              IS '사용자 승인 이벤트 누적. 한 문서당 최대 4행 — 4건 모두 모이면 status=VALID 진입 직전.';
COMMENT ON COLUMN tosalpee.document_approvals.id           IS '승인 이벤트 PK.';
COMMENT ON COLUMN tosalpee.document_approvals.document_id  IS '대상 문서 FK — documents(id).';
COMMENT ON COLUMN tosalpee.document_approvals.stage        IS '이 승인이 통과시킨 다음 stage 값. (document_id, stage) 조합 UNIQUE.';
COMMENT ON COLUMN tosalpee.document_approvals.xrpl_tx_hash IS '사용자 seed 로 서명된 XRPL 트랜잭션 해시 (대문자 hex 64자).';
COMMENT ON COLUMN tosalpee.document_approvals.approved_at  IS '서명 컨펌 시각 (사용자 입력 / 클라 측 시각).';
COMMENT ON COLUMN tosalpee.document_approvals.created_at   IS '레코드 생성 시각 (서버 INSERT 시각).';
COMMENT ON COLUMN tosalpee.document_approvals.updated_at   IS '레코드 갱신 시각.';
COMMENT ON COLUMN tosalpee.document_approvals.is_delete    IS 'Soft-delete 플래그.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 7) document_stages — 5-stage 파이프라인 이벤트 로그 (1 문서 : N 행)
--    "이 단계가 시작/완료/실패했다" 이벤트를 행 단위로 누적.
--    상태 흐름: PENDING → IN_PROGRESS → DONE | FAILED.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.document_stages (
                                          id             BIGSERIAL PRIMARY KEY,
                                          document_id    BIGINT        NOT NULL,
                                          stage          VARCHAR(40)   NOT NULL,
                                          status         VARCHAR(40)   NOT NULL,
                                          tx_hash        CHAR(64),
                                          s3_object_key  VARCHAR(255),
                                          started_at     TIMESTAMP(0),
                                          completed_at   TIMESTAMP(0),
                                          failure_reason TEXT,
                                          created_at     TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                          updated_at     TIMESTAMP(0)  NOT NULL DEFAULT now(),
                                          is_delete      BOOLEAN       NOT NULL DEFAULT false,

                                          CONSTRAINT document_stages_document_fk FOREIGN KEY (document_id)
                                              REFERENCES tosalpee.documents (id)
);

CREATE INDEX idx_document_stages_doc_time     ON tosalpee.document_stages (document_id, created_at);
CREATE INDEX idx_document_stages_stage_status ON tosalpee.document_stages (stage, status);

COMMENT ON TABLE  tosalpee.document_stages                IS '5-stage 파이프라인 이벤트 로그. 한 stage 가 시작/완료/실패할 때마다 1행 누적.';
COMMENT ON COLUMN tosalpee.document_stages.id             IS '이벤트 PK.';
COMMENT ON COLUMN tosalpee.document_stages.document_id    IS '대상 문서 FK — documents(id).';
COMMENT ON COLUMN tosalpee.document_stages.stage          IS '단계 (AUTHORITY_ISSUED | DOCUMENT_ARRIVED | TRANSLATED_NOTARIZED | APOSTILLE_ISSUED | WALLET_STORED).';
COMMENT ON COLUMN tosalpee.document_stages.status         IS '이벤트 상태 (PENDING | IN_PROGRESS | DONE | FAILED).';
COMMENT ON COLUMN tosalpee.document_stages.tx_hash        IS '해당 stage 처리 중 발생한 XRPL TX 해시(있는 경우). hex 64자.';
COMMENT ON COLUMN tosalpee.document_stages.s3_object_key  IS '해당 stage 산출물의 S3 객체 키 (번역본 / 아포스티유 PDF 등).';
COMMENT ON COLUMN tosalpee.document_stages.started_at     IS 'stage 시작 시각.';
COMMENT ON COLUMN tosalpee.document_stages.completed_at   IS 'stage 종료 시각 (DONE / FAILED 진입 시).';
COMMENT ON COLUMN tosalpee.document_stages.failure_reason IS '실패 사유 (status=FAILED 일 때만 의미).';
COMMENT ON COLUMN tosalpee.document_stages.created_at     IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.document_stages.updated_at     IS '레코드 갱신 시각.';
COMMENT ON COLUMN tosalpee.document_stages.is_delete      IS 'Soft-delete 플래그.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 8) credential_issue_requests — Credential bounded context issue request
--    MVP: 4-stage pipeline + Internal JWT.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tosalpee.credential_issue_requests (
                                                                  id                  BIGSERIAL PRIMARY KEY,
                                                                  issue_request_code  UUID          NOT NULL,
                                                                  user_id             BIGINT        NOT NULL,
                                                                  document_type_code  VARCHAR(40)   NOT NULL,
    document_code       UUID,
    status              VARCHAR(20)   NOT NULL,
    current_stage       VARCHAR(30)   NOT NULL,
    is_suspended        BOOLEAN       NOT NULL DEFAULT false,
    requested_at        TIMESTAMP(0)  NOT NULL,
    issued_at           TIMESTAMP(0),
    failed_at           TIMESTAMP(0),
    failure_reason      TEXT,
    created_at          TIMESTAMP(0)  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP(0)  NOT NULL DEFAULT now(),
    is_delete           BOOLEAN       NOT NULL DEFAULT false,

    CONSTRAINT credential_issue_requests_code_unique UNIQUE (issue_request_code),
    CONSTRAINT credential_issue_requests_user_fk FOREIGN KEY (user_id)
    REFERENCES tosalpee.users (id),
    CONSTRAINT credential_issue_requests_doctype_fk FOREIGN KEY (document_type_code)
    REFERENCES tosalpee.document_types (code),
    CONSTRAINT credential_issue_requests_document_fk FOREIGN KEY (document_code)
    REFERENCES tosalpee.documents (document_code)
    );

CREATE INDEX IF NOT EXISTS idx_credential_issue_requests_user_time
    ON tosalpee.credential_issue_requests (user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_credential_issue_requests_document
    ON tosalpee.credential_issue_requests (document_code);
CREATE INDEX IF NOT EXISTS idx_credential_issue_requests_status_stage
    ON tosalpee.credential_issue_requests (status, current_stage);

COMMENT ON TABLE tosalpee.credential_issue_requests IS 'Credential 발급 요청. 최신 MVP 4-stage pipeline 상태를 저장한다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.id                 IS '내부 PK. 외부 API 응답에는 노출하지 않는다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.issue_request_code IS '외부 노출용 발급 요청 UUID. API path/response에서 issueRequestId로 사용한다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.user_id            IS '발급 요청 사용자 FK — users(id). Internal JWT에서 식별된 사용자와 매칭된다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.document_type_code IS '요청한 문서/credential 종류 코드 — document_types(code).';
COMMENT ON COLUMN tosalpee.credential_issue_requests.document_code       IS '원본 Document FK — documents(document_code). nullable 이며 문서 연동이 있는 발급 요청만 채운다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.status             IS '발급 요청 상태. 예: ISSUED | FAILED.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.current_stage      IS '4-stage 발급 파이프라인 현재 단계. 예: MYDATA_RECEIVED | DOCUMENT_MOVED | TRANSLATION_RECEIVED | APOSTILLE_RECEIVED.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.is_suspended       IS '발급 절차 일시 정지 여부. true면 다음 단계로 진행하지 않는다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.requested_at       IS '사용자가 발급 요청을 생성한 시각.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.issued_at          IS '발급 완료 시각. 발급 전 또는 실패 시 NULL일 수 있다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.failed_at          IS '발급 실패 시각. 실패 전에는 NULL.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.failure_reason     IS '발급 실패 사유. status=FAILED일 때 주로 사용한다.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.created_at         IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.updated_at         IS '레코드 마지막 갱신 시각.';
COMMENT ON COLUMN tosalpee.credential_issue_requests.is_delete          IS 'Soft-delete 플래그. true면 일반 조회에서 제외한다.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 9) credentials — user-held credential result
--    XRP Testnet evidence is allowed for hackathon review. Mainnet finality is not claimed.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tosalpee.credentials (
                                                    id                    BIGSERIAL PRIMARY KEY,
                                                    credential_code       UUID          NOT NULL,
                                                    issue_request_id      BIGINT        NOT NULL,
                                                    user_id               BIGINT        NOT NULL,
                                                    document_code         UUID          NOT NULL,
                                                    document_type_code    VARCHAR(40)   NOT NULL,
    document_type_name    VARCHAR(100)  NOT NULL,
    issuer_code           VARCHAR(20)   NOT NULL,
    status                VARCHAR(20)   NOT NULL,
    current_stage         VARCHAR(30)   NOT NULL,
    created_xrpl_transaction_id BIGINT UNIQUE,
    accepted_xrpl_transaction_id BIGINT UNIQUE,
    revoked_xrpl_transaction_id BIGINT UNIQUE,
    credential_created_at TIMESTAMP(0)  NOT NULL,
    expires_at            TIMESTAMP(0)  NOT NULL,
    revoked_at            TIMESTAMP(0),
    created_at            TIMESTAMP(0)  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP(0)  NOT NULL DEFAULT now(),
    is_delete             BOOLEAN       NOT NULL DEFAULT false,

    CONSTRAINT credentials_code_unique UNIQUE (credential_code),
    CONSTRAINT credentials_issue_request_unique UNIQUE (issue_request_id),
    CONSTRAINT credentials_issue_request_fk FOREIGN KEY (issue_request_id)
    REFERENCES tosalpee.credential_issue_requests (id),
    CONSTRAINT credentials_user_fk FOREIGN KEY (user_id)
    REFERENCES tosalpee.users (id),
    CONSTRAINT credentials_document_fk FOREIGN KEY (document_code)
    REFERENCES tosalpee.documents (document_code),
    CONSTRAINT credentials_doctype_fk FOREIGN KEY (document_type_code)
    REFERENCES tosalpee.document_types (code)
    );

CREATE INDEX IF NOT EXISTS idx_credentials_user_created
    ON tosalpee.credentials (user_id, credential_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credentials_document
    ON tosalpee.credentials (document_code);
CREATE INDEX IF NOT EXISTS idx_credentials_user_stage
    ON tosalpee.credentials (user_id, current_stage);
CREATE INDEX IF NOT EXISTS idx_credentials_status_expires
    ON tosalpee.credentials (status, expires_at);

COMMENT ON TABLE tosalpee.credentials IS '사용자 보유 Credential. XRPL 증적은 credential_xrpl_transactions 에 저장하고, credentials 는 lifecycle/current_stage snapshot과 생성/수락/폐기 증적 FK만 보관한다.';
COMMENT ON COLUMN tosalpee.credentials.id                   IS '내부 PK. 외부 API 응답에는 노출하지 않는다.';
COMMENT ON COLUMN tosalpee.credentials.credential_code      IS '외부 노출용 Credential UUID. API path/response에서 credentialId로 사용한다.';
COMMENT ON COLUMN tosalpee.credentials.issue_request_id     IS 'Credential을 생성한 발급 요청 FK — credential_issue_requests(id). 한 발급 요청은 하나의 Credential만 생성한다.';
COMMENT ON COLUMN tosalpee.credentials.user_id              IS 'Credential 소유 사용자 FK — users(id). 사용자별 조회/권한 검증 기준이다.';
COMMENT ON COLUMN tosalpee.credentials.document_code        IS '원본 Document FK — documents(document_code). document 연동이 있는 credential만 채운다.';
COMMENT ON COLUMN tosalpee.credentials.document_type_code   IS 'Credential의 문서 종류 코드 — document_types(code).';
COMMENT ON COLUMN tosalpee.credentials.document_type_name   IS '발급 시점의 문서 종류 표시명 snapshot. 카탈로그 명칭 변경 후에도 이력을 보존한다.';
COMMENT ON COLUMN tosalpee.credentials.issuer_code          IS '발급 기관 코드 snapshot. 예: KR-NTS.';
COMMENT ON COLUMN tosalpee.credentials.status               IS 'Credential lifecycle 상태. 예: CREATED | ACCEPTED | EXPIRED | REVOKED.';
COMMENT ON COLUMN tosalpee.credentials.current_stage        IS 'Credential 생성 시점의 credential_issue_requests.current_stage snapshot.';
COMMENT ON COLUMN tosalpee.credentials.created_xrpl_transaction_id IS 'CredentialCreate XRPL 증적 FK — credential_xrpl_transactions(id).';
COMMENT ON COLUMN tosalpee.credentials.accepted_xrpl_transaction_id IS 'CredentialAccept XRPL 증적 FK — credential_xrpl_transactions(id).';
COMMENT ON COLUMN tosalpee.credentials.revoked_xrpl_transaction_id IS 'CredentialDelete / revoke XRPL 증적 FK — credential_xrpl_transactions(id).';
COMMENT ON COLUMN tosalpee.credentials.credential_created_at IS 'Credential 발급 완료 시각.';
COMMENT ON COLUMN tosalpee.credentials.expires_at           IS 'Credential 유효기간 종료 시각. 제출 가능 여부 검증에 사용한다.';
COMMENT ON COLUMN tosalpee.credentials.revoked_at           IS 'Credential 폐기 시각. status=REVOKED일 때 주로 사용한다.';
COMMENT ON COLUMN tosalpee.credentials.created_at           IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.credentials.updated_at           IS '레코드 마지막 갱신 시각.';
COMMENT ON COLUMN tosalpee.credentials.is_delete            IS 'Soft-delete 플래그. true면 일반 조회에서 제외한다.';


-- ═══════════════════════════════════════════════════════════════════════════
-- 10) credential_xrpl_transactions — XRP Testnet XLS-70 transaction evidence
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tosalpee.credential_xrpl_transactions (
                                                                     id                BIGSERIAL PRIMARY KEY,
                                                                     credential_id     BIGINT        NOT NULL,
                                                                     transaction_kind  VARCHAR(20)   NOT NULL,
    network           VARCHAR(40)   NOT NULL,
    tx_hash           CHAR(64)      NOT NULL,
    engine_result     VARCHAR(40)   NOT NULL,
    failure_reason    TEXT,
    ledger_index      BIGINT,
    validated         BOOLEAN       NOT NULL DEFAULT false,
    fee_drops         VARCHAR(40),
    account_address   VARCHAR(35)   NOT NULL,
    issuer_address    VARCHAR(35),
    subject_address   VARCHAR(35),
    credential_type   VARCHAR(128)  NOT NULL,
    flags             INT,
    object_snapshot   JSONB,
    created_at        TIMESTAMP(0)  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP(0)  NOT NULL DEFAULT now(),
    is_delete         BOOLEAN       NOT NULL DEFAULT false,

    CONSTRAINT credential_xrpl_transactions_credential_fk FOREIGN KEY (credential_id)
    REFERENCES tosalpee.credentials (id)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_credential_xrpl_transactions_tx_hash
    ON tosalpee.credential_xrpl_transactions (tx_hash);
CREATE INDEX IF NOT EXISTS idx_credential_xrpl_transactions_credential_kind
    ON tosalpee.credential_xrpl_transactions (credential_id, transaction_kind);
CREATE INDEX IF NOT EXISTS idx_credential_xrpl_transactions_network_ledger
    ON tosalpee.credential_xrpl_transactions (network, ledger_index);

COMMENT ON TABLE tosalpee.credential_xrpl_transactions IS '해커톤 심사용 XRP Testnet XLS-70 transaction evidence. Production/mainnet finality 아님.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.id               IS '내부 PK. 외부 API 응답에는 노출하지 않는다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.credential_id    IS '대상 Credential FK — credentials(id). 한 Credential에 여러 XRPL transaction evidence가 누적될 수 있다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.transaction_kind IS 'XLS-70 transaction 종류. CREATE | ACCEPT | DELETE 중 하나.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.network          IS 'XRPL 네트워크 식별자. MVP는 XRP Testnet evidence만 저장한다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.tx_hash          IS 'XRPL transaction hash. transaction evidence의 idempotency 및 explorer 조회 키로 사용한다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.engine_result    IS 'XRPL transaction result code. 예: tesSUCCESS, tec*, tem*.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.failure_reason    IS 'XRPL transaction 실패/검증 실패 사유. credentials 테이블에는 저장하지 않는다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.ledger_index     IS 'transaction이 포함된 validated ledger index. 제출 실패/미검증 시 NULL일 수 있다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.validated        IS 'transaction이 validated ledger에 포함되었는지 여부.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.fee_drops        IS 'transaction 수수료 drops 문자열. XRP 단위 변환 전 원시 값이다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.account_address  IS 'transaction submitter Account 주소. CREATE는 issuer, ACCEPT는 subject, DELETE는 submitter.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.issuer_address   IS 'XLS-70 Credential issuer 주소. transaction 종류에 따라 nullable일 수 있다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.subject_address  IS 'XLS-70 Credential subject 주소. transaction 종류에 따라 nullable일 수 있다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.credential_type  IS 'XLS-70 CredentialType hex 값. issuer+subject와 함께 Credential object를 식별한다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.flags            IS '조회된 Credential ledger object의 Flags 값. accepted 상태는 lsfAccepted(65536)로 확인한다.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.object_snapshot  IS 'transaction 후 account_objects로 조회한 Credential ledger object snapshot JSON. 심사/디버깅 증거용.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.created_at       IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.updated_at       IS '레코드 마지막 갱신 시각.';
COMMENT ON COLUMN tosalpee.credential_xrpl_transactions.is_delete        IS 'Soft-delete 플래그. true면 일반 조회에서 제외한다.';

ALTER TABLE tosalpee.credentials
    ADD CONSTRAINT credential_created_xrpl_transaction_fk FOREIGN KEY (created_xrpl_transaction_id)
        REFERENCES tosalpee.credential_xrpl_transactions (id),
    ADD CONSTRAINT credential_accepted_xrpl_transaction_fk FOREIGN KEY (accepted_xrpl_transaction_id)
        REFERENCES tosalpee.credential_xrpl_transactions (id),
    ADD CONSTRAINT credential_revoked_xrpl_transaction_fk FOREIGN KEY (revoked_xrpl_transaction_id)
        REFERENCES tosalpee.credential_xrpl_transactions (id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 11) credential_submissions — institution submission rows
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tosalpee.credential_submissions (
                                                               id                         BIGSERIAL PRIMARY KEY,
                                                               submission_code            UUID          NOT NULL,
                                                               credential_id              BIGINT        NOT NULL,
                                                               credential_code            UUID          NOT NULL,
                                                               user_id                    BIGINT        NOT NULL,
                                                               submission_request_id      VARCHAR(80)   NOT NULL,
    recipient_institution_id   VARCHAR(80)   NOT NULL,
    recipient_institution_name VARCHAR(120)  NOT NULL,
    status                     VARCHAR(20)   NOT NULL,
    rejection_reason           TEXT,
    submitted_at               TIMESTAMP(0)  NOT NULL,
    created_at                 TIMESTAMP(0)  NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMP(0)  NOT NULL DEFAULT now(),
    is_delete                  BOOLEAN       NOT NULL DEFAULT false,

    CONSTRAINT credential_submissions_code_unique UNIQUE (submission_code),
    CONSTRAINT credential_submissions_credential_fk FOREIGN KEY (credential_id)
    REFERENCES tosalpee.credentials (id),
    CONSTRAINT credential_submissions_user_fk FOREIGN KEY (user_id)
    REFERENCES tosalpee.users (id)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_credential_submissions_credential_request
    ON tosalpee.credential_submissions (credential_id, submission_request_id);
CREATE INDEX IF NOT EXISTS idx_credential_submissions_user_time
    ON tosalpee.credential_submissions (user_id, submitted_at DESC);

COMMENT ON TABLE tosalpee.credential_submissions IS 'Credential 기관 제출 이력. Row unit은 credential x institution submission request 1건.';
COMMENT ON COLUMN tosalpee.credential_submissions.id                         IS '내부 PK. 외부 API 응답에는 노출하지 않는다.';
COMMENT ON COLUMN tosalpee.credential_submissions.submission_code            IS '외부 노출용 제출 UUID. API 응답에서 submissionId로 사용한다.';
COMMENT ON COLUMN tosalpee.credential_submissions.credential_id              IS '제출 대상 Credential FK — credentials(id).';
COMMENT ON COLUMN tosalpee.credential_submissions.credential_code            IS '제출 대상 Credential 외부 UUID snapshot. 응답 매핑 및 추적용 denormalized copy.';
COMMENT ON COLUMN tosalpee.credential_submissions.user_id                    IS '제출 사용자 FK — users(id). 소유자 조회/권한 검증 기준이다.';
COMMENT ON COLUMN tosalpee.credential_submissions.submission_request_id      IS '기관이 만든 제출 요청 id 또는 외부 요청 참조. Institution/Admin 도메인 확정 전 문자열로 보관한다.';
COMMENT ON COLUMN tosalpee.credential_submissions.recipient_institution_id   IS 'Credential을 제출받는 기관 id 또는 기관 요청 참조.';
COMMENT ON COLUMN tosalpee.credential_submissions.recipient_institution_name IS '제출받는 기관 표시명 snapshot. 기관명 변경 후에도 제출 이력을 보존한다.';
COMMENT ON COLUMN tosalpee.credential_submissions.status                     IS '기관 제출 처리 상태. RECEIVED | VERIFYING | REJECTED.';
COMMENT ON COLUMN tosalpee.credential_submissions.rejection_reason           IS '기관 반려 사유. status=REJECTED일 때 dispute 전환 context로 사용한다.';
COMMENT ON COLUMN tosalpee.credential_submissions.submitted_at               IS '사용자가 Credential을 기관 요청에 제출한 시각.';
COMMENT ON COLUMN tosalpee.credential_submissions.created_at                 IS '레코드 생성 시각.';
COMMENT ON COLUMN tosalpee.credential_submissions.updated_at                 IS '레코드 마지막 갱신 시각.';
COMMENT ON COLUMN tosalpee.credential_submissions.is_delete                  IS 'Soft-delete 플래그. true면 일반 조회에서 제외한다.';


-- ───────────────────────────────────────────────────────────────────────────
-- 적용 결과 확인
-- ───────────────────────────────────────────────────────────────────────────
SELECT table_name, COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'tosalpee'
GROUP BY table_name
ORDER BY table_name;


-- ═══════════════════════════════════════════════════════════════════════════
-- 12) disputes — 분쟁 관리
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.disputes (
                                   id            VARCHAR(20)   PRIMARY KEY,
                                   status        VARCHAR(20)   NOT NULL,
                                   type          VARCHAR(20)   NOT NULL,
                                   target_stage  VARCHAR(30)   NOT NULL,
                                   request_id    VARCHAR(40)   NOT NULL,
                                   requester_id  BIGINT        NOT NULL,
                                   operator_id   BIGINT,
                                   sla_deadline  TIMESTAMPTZ(0) NOT NULL,
                                   is_sla_paused BOOLEAN       NOT NULL DEFAULT false,
                                   created_at    TIMESTAMPTZ(0) NOT NULL DEFAULT now(),
                                   updated_at    TIMESTAMPTZ(0) NOT NULL DEFAULT now(),

                                   CONSTRAINT disputes_requester_fk FOREIGN KEY (requester_id) REFERENCES tosalpee.users(id)
);

CREATE INDEX idx_disputes_requester ON tosalpee.disputes (requester_id);
CREATE INDEX idx_disputes_operator_status ON tosalpee.disputes (operator_id, status);

COMMENT ON TABLE  tosalpee.disputes               IS '분쟁(Dispute) 마스터 테이블.';
COMMENT ON COLUMN tosalpee.disputes.id            IS '분쟁 ID (DSP-YYYY-NNNN).';
COMMENT ON COLUMN tosalpee.disputes.status        IS '분쟁 상태 (RECEIVED | ASSIGNED | IN_REVIEW | INFO_REQUESTED | RESOLVED | REJECTED).';
COMMENT ON COLUMN tosalpee.disputes.type          IS '분쟁 유형 (TYPO | IDENTITY_MISMATCH | DOCUMENT_INVALID | OTHER).';
COMMENT ON COLUMN tosalpee.disputes.target_stage  IS '분쟁이 제기된 발급 단계 snapshot. 예: MYDATA_RECEIVED.';
COMMENT ON COLUMN tosalpee.disputes.request_id    IS '원문 발급 요청 코드 (issue_request_code).';
COMMENT ON COLUMN tosalpee.disputes.requester_id  IS '분쟁 제기 사용자 ID (FK).';
COMMENT ON COLUMN tosalpee.disputes.operator_id   IS '담당 운영자 ID (FK).';
COMMENT ON COLUMN tosalpee.disputes.sla_deadline  IS 'SLA 처리 마감 시각.';
COMMENT ON COLUMN tosalpee.disputes.is_sla_paused IS 'SLA 일시정지 여부 (INFO_REQUESTED 시 true).';

-- ═══════════════════════════════════════════════════════════════════════════
-- 13) dispute_timeline — 분쟁 타임라인/로그
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE tosalpee.dispute_timeline (
                                           id          BIGSERIAL PRIMARY KEY,
                                           dispute_id  VARCHAR(20)   NOT NULL,
                                           status      VARCHAR(20)   NOT NULL,
                                           note        TEXT,
                                           operator_id BIGINT,
                                           is_internal BOOLEAN       NOT NULL DEFAULT false,
                                           created_at  TIMESTAMPTZ(0) NOT NULL DEFAULT now(),

                                           CONSTRAINT dispute_timeline_dispute_fk FOREIGN KEY (dispute_id) REFERENCES tosalpee.disputes(id) ON DELETE CASCADE
);

CREATE INDEX idx_dispute_timeline_dispute_time ON tosalpee.dispute_timeline (dispute_id, created_at);

COMMENT ON TABLE  tosalpee.dispute_timeline               IS '분쟁 타임라인 및 처리 이력.';
COMMENT ON COLUMN tosalpee.dispute_timeline.dispute_id    IS '대상 분쟁 ID (FK).';
COMMENT ON COLUMN tosalpee.dispute_timeline.status        IS '기록 시점의 상태.';
COMMENT ON COLUMN tosalpee.dispute_timeline.note          IS '처리 메모 또는 사유.';
COMMENT ON COLUMN tosalpee.dispute_timeline.operator_id   IS '작성 운영자 ID.';
COMMENT ON COLUMN tosalpee.dispute_timeline.is_internal   IS '내부 전용 여부 (true면 사용자에게 비노출).';


-- ───────────────────────────────────────────────────────────────────────────
-- 적용 결과 확인 (dispute 포함 최종)
-- ───────────────────────────────────────────────────────────────────────────
SELECT table_name, COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'tosalpee'
GROUP BY table_name
ORDER BY table_name;
