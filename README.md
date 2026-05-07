# MyApoBE

XRPL 표준을 아포스티유 발행 인증 및 추적 서비스 "MyApo"의 Backend 레포지토리입니다. 

- English Version: [Click this!](./README.en.md)

---

## 기술 스택

| 항목 | 기술 | 버전 |
| :--- | :--- | :--- |
| 프레임워크 | NestJS | 10.x |
| 언어 | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| 데이터베이스 | PostgreSQL | 15+ |
| API 문서 | Swagger / OpenAPI | 3.0 |

---

## AI 에이전트 컨텍스트

이 프로젝트는 아키텍처 일관성과 사양 중심 개발을 보장하기 위해 AI 에이전트(Gemini, Claude 등)를 위한 구조화된 컨텍스트 시스템을 사용합니다.

모든 AI 세션은 반드시 Control Plane을 읽는 것으로 시작해야 합니다:
[.ai-agent-context/.orchestrator.md](./.ai-agent-context/.orchestrator.md)

### 컨텍스트 구조
- Rules (.ai-agent-context/rules/): 아키텍처 원칙, 코딩 컨벤션, 명명 규칙 및 테스트 전략에 대한 단일 진실 공급원(SSOT)입니다.
- Specs (.ai-agent-context/specs/): 도메인 주도 설계 사양, 유비쿼터스 언어 및 API 계약입니다.
- ADRs (.ai-agent-context/adrs/): 기술적 선택의 배경인 "이유"를 기록한 아키텍처 결정 기록입니다.
- References (.ai-agent-context/references/): 외부 표준(XRPL, W3C) 및 기술 문서입니다.

---

## 환경 설정

1. 환경 변수 템플릿 복사
   ```bash
   cp .env.example .env
   ```

2. 데이터베이스 연결 설정
   .env 파일을 편집하여 PostgreSQL 접속 정보를 설정하십시오:
   ```text
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<NAME>?schema=<SCHEMA>"
   PORT=4000
   NODE_ENV=development
   ```

3. 특수 문자 URL 인코딩
   비밀번호에 특수 문자가 포함된 경우 반드시 URL 인코딩을 해야 합니다:

   - `#` -> %23
   - `$` -> %24
   - `@` -> %40

---

## 주의 사항 및 제약 조건

- prisma migrate 사용 금지: 데이터베이스 스키마는 외부에서 관리됩니다. prisma db pull을 사용하여 동기화하고 prisma generate로 클라이언트를 업데이트하십시오.
- 의존성 방향: 의존성 규칙을 엄격히 준수하십시오: Interfaces -> Application -> Domain <- Infrastructure.
- 에러 모델: rules/conventions/coding-convention.md에 정의된 통합 DomainError + ErrorCode 모델을 사용하십시오.
- 데이터베이스 권한: 사용자가 스키마 및 시퀀스에 대해 적절한 GRANT 권한을 가지고 있는지 확인하십시오.

---

## 시작하기

### 설치 및 빌드
```bash
npm install
npx prisma generate
npm run build
```

### 실행 명령
| 모드 | 명령 |
| :--- | :--- |
| 개발 모드 | npm run start:dev (Watch 모드) |
| 1회 실행 | npm run start |
| 운영 모드 | npm run build && npm run start:prod |

### API 문서
- Swagger UI: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/docs-json
- 인증: Swagger UI의 Authorize 버튼을 사용하여 Bearer JWT를 입력하십시오.

---

## 스크립트 참조

| 스크립트 | 설명 |
| :--- | :--- |
| npm run lint | ESLint 실행 및 자동 수정 |
| npm run format | Prettier를 사용한 코드 포맷팅 |
| npm test | Jest 유닛 테스트 실행 |
| npm run test:e2e | Jest E2E 테스트 실행 |
| npm run prisma:pull | 원격 DB에서 로컬 스키마 동기화 |
| npm run prisma:studio | Prisma Studio GUI 열기 |
