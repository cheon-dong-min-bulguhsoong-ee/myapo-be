# CredBundleBE

NestJS 10 + Prisma 5 기반 **Credential Bundle Loan** 백엔드. 클린 레이어드 아키텍쳐(`domain` / `infrastructure` / `interfaces`) 로 구성됨. REST + Swagger UI 제공.

---

## 1. Prerequisites

- **Node.js 20+** (NestJS 10 / Prisma 5 와 호환)
- **npm** (또는 pnpm)
- 접근 가능한 **PostgreSQL** 인스턴스 (스키마 명 + DB 사용자 권한 확보)

---

## 2. Environment

`.env` 파일은 git-ignore 대상입니다. `.env.example` 을 복사해서 자기 환경 값으로 채워 주세요.

```bash
cp .env.example .env
```

`.env`:

```
DATABASE_URL="postgresql://<DB_USER>:<URL_ENCODED_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?schema=<DB_SCHEMA>"
PORT=4000
NODE_ENV=development
```

**주의**

- 비밀번호 특수문자는 반드시 URL-encode: `#` → `%23`, `$` → `%24`, `@` → `%40` 등.
- 본 프로젝트는 외부에서 관리되는 스키마(테이블)를 사용합니다. `prisma migrate` 는 **절대 실행하지 마세요**. `prisma generate` (클라이언트 재생성) 또는 `prisma db pull` (스키마 → schema.prisma 동기화) 만 사용합니다.
- DB 사용자에게 다음 권한이 필요합니다:
  ```sql
  GRANT USAGE ON SCHEMA "<DB_SCHEMA>" TO "<DB_USER>";
  GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA "<DB_SCHEMA>" TO "<DB_USER>";
  GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA "<DB_SCHEMA>" TO "<DB_USER>";
  ALTER DEFAULT PRIVILEGES IN SCHEMA "<DB_SCHEMA>"
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "<DB_USER>";
  ALTER DEFAULT PRIVILEGES IN SCHEMA "<DB_SCHEMA>"
    GRANT USAGE, SELECT ON SEQUENCES TO "<DB_USER>";
  ```

---

## 3. Install & Build

```bash
npm install
npx prisma generate     # Prisma Client 산출물 생성
npm run build           # dist/ 빌드
```

빌드 결과는 `dist/` 에 떨어집니다.

---

## 4. Run

| Mode | Command | 설명 |
|---|---|---|
| Watch (개발) | `npm run start:dev` | nest --watch, 파일 변경 시 자동 재시작 |
| One-shot | `npm run start` | 1회 실행 (TS 직접) |
| Production | `npm run build && npm run start:prod` | `dist/main.js` 실행 |

서버가 뜨면 두 줄 로그가 출력됩니다:

```
[CredBundleBE] listening on http://localhost:4000/api/v1
  Swagger UI: http://localhost:4000/docs
```

---

## 5. Swagger / OpenAPI

서버 실행 중에 다음 두 URL 사용:

- **Swagger UI**: <http://localhost:4000/docs>
  - 5개 엔드포인트를 브라우저에서 직접 호출 가능 (Try it out).
- **OpenAPI JSON**: <http://localhost:4000/docs-json>
  - 스펙을 JSON 으로 내려받아 클라이언트 코드 생성에 사용 가능.

`BaseResponse<T>` 제네릭은 `ApiBaseResponse(...)` 헬퍼 데코레이터로 OpenAPI schema 에 정확히 표현됩니다 (`allOf` + `data` 필드 ref). enum 은 모두 별도 schema 로 등록됨 (`ResultType`, `MyDataCategory`, `ComplianceTrigger`, `AdmissionResult` 등).

---

## 6. Architecture

```
src/
├── main.ts                       # 부팅, ValidationPipe, Swagger setup
├── app.module.ts                 # 루트 모듈 (Composition Root는 InfrastructureModule)
└── app/
    ├── domain/                   # 외부 의존 zero (NestJS 데코레이터 외)
    │   ├── common/               # DomainException base
    │   ├── user/                 # User, UserStatus
    │   ├── mydata/               # MyDataSnapshot, MyDataService
    │   ├── issuer/               # Credential, IssuerService
    │   ├── compliance/           # ComplianceEvent, ComplianceService
    │   ├── gateway/              # AdmissionLog, GatewayService
    │   └── xrpl/                 # XrplCredentialClient (port), XrplTransaction
    ├── infrastructure/           # 외부 시스템 어댑터 (Composition Root)
    │   ├── infrastructure.module.ts   # @Global, 도메인 토큰 → 구현체 일괄 binding
    │   ├── prisma/               # PrismaService + Module
    │   ├── repository/           # Prisma* repositories
    │   └── xrpl/                 # XrplCredentialClientStub
    └── interfaces/               # HTTP 진입점
        ├── common/               # BaseResponse, AllExceptionsFilter, ApiBaseResponse
        ├── mydata/               # GET /api/v1/mydata/:address[/:category]
        ├── issuer/               # POST /api/v1/issuer/issue/:address
        ├── compliance/           # POST /api/v1/compliance/check/:address
        └── gateway/              # POST /api/v1/gateway/verify/:address
```

**의존 방향 규칙**

- `interfaces → domain ← infrastructure`
- `interfaces` 는 `infrastructure` 의 어떤 파일도 직접 import 하지 않음 (모든 wiring 은 `InfrastructureModule` 이 처리).
- `domain` 은 NestJS 외 외부 라이브러리(Prisma, xrpl, swagger 등) 를 모름.

---

## 7. API Endpoints

`Base: http://localhost:4000/api/v1`

| Method | Path | Description |
|---|---|---|
| GET | `/mydata/:address` | 5종 마이데이터 스냅샷 번들 조회 |
| GET | `/mydata/:address/:category` | 단일 카테고리 스냅샷 (VISA_STAY 등) |
| POST | `/issuer/issue/:address` | 마이데이터 → XLS-70 Credential 일괄 발행 |
| POST | `/compliance/check/:address` | 리스크 평가 + 필요 시 XLS-77d Deep Freeze |
| POST | `/gateway/verify/:address` | XLS-80 Permissioned Domain 입장 자격 검증 |

응답 포맷은 모두 `BaseResponse<T>`:

```json
{ "resultType": "SUCCESS", "data": { ... }, "exception": null }
```

```json
{
  "resultType": "FAIL",
  "data": null,
  "exception": { "code": "USER_NOT_FOUND", "message": "...", "data": { ... } }
}
```

자세한 schema 는 Swagger UI 참고.

---

## 8. 도메인 → 테이블 매핑

| Bounded Context | Table |
|---|---|
| `user/` | `users`, `user_profiles` |
| `mydata/` | `mydata_snapshots` |
| `issuer/` | `credentials` |
| `compliance/` | `compliance_events` |
| `gateway/` | `admission_logs` |
| `xrpl/` | `xrpl_transactions` |

Prisma 스키마(`prisma/schema.prisma`) 는 외부 DB 의 실제 테이블 구조와 동기화되어 있습니다. DB 가 변경되면 `npx prisma db pull` 로 schema 를 갱신하고 `npx prisma generate` 로 클라이언트 재생성.

---

## 9. XRPL 클라이언트

기본 제공된 `XrplCredentialClientStub` 은 트랜잭션을 실제로 보내지 않고 **가짜 hash 를 리턴** 합니다 (PoC 용). 실제 운영 시 `xrpl` 패키지 기반 구현체로 교체하고 `InfrastructureModule` 의 `XrplCredentialClient` provider 의 `useClass` 만 바꾸면 됩니다.

---

## 10. Scripts 요약

| Script | 동작 |
|---|---|
| `npm run start:dev` | watch 모드 |
| `npm run start` | 1회 실행 |
| `npm run start:prod` | `dist/main.js` (build 선행 필요) |
| `npm run build` | `nest build` (TS → JS) |
| `npm run lint` | ESLint --fix |
| `npm run format` | Prettier |
| `npm test` | jest unit |
| `npm run test:e2e` | jest e2e |
| `npm run prisma:generate` | Prisma Client 재생성 |
| `npm run prisma:pull` | DB → schema.prisma 동기화 |
| `npm run prisma:studio` | Prisma Studio (DB 브라우저) |
