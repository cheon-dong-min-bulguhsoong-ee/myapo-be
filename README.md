# MyApoBE

NestJS 10 + Prisma 5 기반 백엔드. REST + Swagger UI 제공.

> 코드 추가/수정 시 따라야 할 아키텍처·디렉터리·네이밍·응답·에러 컨벤션은 모두 [`CLAUDE.md`](./CLAUDE.md) 가 단일 진실 소스. 본 README 는 환경 구성과 실행 방법만 다룬다.

---

## 1. Prerequisites

- **Node.js 20+** (NestJS 10 / Prisma 5 호환)
- **npm**
- 접근 가능한 **PostgreSQL** 인스턴스

---

## 2. Environment

`.env` 는 git-ignore. `.env.example` 을 복사해서 채워 주세요.

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://<DB_USER>:<URL_ENCODED_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?schema=<DB_SCHEMA>"
PORT=4000
NODE_ENV=development
```

**주의**

- 비밀번호 특수문자는 URL-encode (`#` → `%23`, `$` → `%24`, `@` → `%40`).
- 스키마는 외부에서 관리되므로 `prisma migrate` **금지**. `prisma generate` (클라이언트 재생성), `prisma db pull` (스키마 동기화) 만 사용.
- DB 사용자 권한:
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
npx prisma generate
npm run build
```

---

## 4. Run

| Mode | Command |
|---|---|
| Watch (개발) | `npm run start:dev` |
| One-shot | `npm run start` |
| Production | `npm run build && npm run start:prod` |

기동 로그:

```
[MyApoBE] listening on http://localhost:4000/api/v1
  Swagger UI: http://localhost:4000/docs
```

---

## 5. Swagger / OpenAPI

- **Swagger UI**: <http://localhost:4000/docs>
- **OpenAPI JSON**: <http://localhost:4000/docs-json>

보호된 엔드포인트는 Swagger UI 우상단 **Authorize** 버튼으로 Bearer 토큰 입력.
응답 래핑·에러 포맷 등 컨벤션은 `CLAUDE.md` 참고.

---

## 6. Scripts

| Script | 동작 |
|---|---|
| `npm run start:dev` | watch 모드 |
| `npm run start` | 1회 실행 |
| `npm run start:prod` | `dist/main.js` (build 선행) |
| `npm run build` | `nest build` |
| `npm run lint` | ESLint --fix |
| `npm run format` | Prettier |
| `npm test` | jest unit |
| `npm run test:e2e` | jest e2e |
| `npm run prisma:generate` | Prisma Client 재생성 |
| `npm run prisma:pull` | DB → schema.prisma 동기화 |
| `npm run prisma:studio` | Prisma Studio |
