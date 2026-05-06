# CLAUDE.md — MyApoBE 작업 규칙

이 저장소에서 코드를 추가/수정할 때 **반드시** 따라야 하는 아키텍처 규칙과 패턴.
사람과 AI 모두 동일하게 적용. 규칙이 모호하면 §1-1 디렉터리 트리와 §3 체크리스트를 정답으로 간주한다.
구체적인 도메인 컨텍스트 (`<ctx>`) 와 클래스명은 시점에 따라 바뀌므로, 현존하는 모듈 중 하나를 골라 같은 패턴을 따라간다.

---

## 1. 아키텍처 — Clean Layered

### 1-1. 레이어와 디렉터리

```
src/
├── main.ts                                          ← 부팅 + ValidationPipe + Swagger
├── app.module.ts                                    ← 루트. interfaces 의 모듈만 import
└── app/
    ├── interfaces/                                  ← HTTP 진입점 (얇음)
    │   ├── common/                                  ← CommonRes, ApiCommonRes, CommonModule
    │   ├── exception/                               ← ApiExceptionHandler (글로벌 필터 — DomainError → HTTP 응답)
    │   └── <ctx>/
    │       ├── controller/<name>.controller.ts      ← 검증·매핑만, 비즈니스 로직 X
    │       ├── req/<name>.req.ts                    ← class-validator 데코레이터로 입력 검증
    │       ├── res/<name>.res.ts                    ← static from(result) 매퍼 보유
    │       ├── swagger/<ctx>.swagger.api.ts         ← @ApiOperation/@ApiResponse 데코레이터 모음
    │       ├── auth/                                ← (선택) 가드·current-user 데코레이터
    │       └── <ctx>.module.ts                      ← controllers + facade + 도메인 서비스 + 가드
    ├── application/
    │   └── <name>.facade.ts                         ← 유스케이스 조합. 도메인 서비스 오케스트레이션
    ├── domain/                                      ← 외부 라이브러리 모름 (Nest 데코레이터만 OK)
    │   ├── common/
    │   │   ├── contract/<port>.ts                   ← 도메인-횡단 포트 (PasswordEncoder 등)
    │   │   ├── enum/*.enum.ts
    │   │   └── error/                                ← DomainError · ErrorCode (전 도메인 공통)
    │   └── <ctx>/
    │       ├── entity/<name>.entity.ts              ← 순수 클래스. readonly 필드 + 도메인 메서드
    │       ├── enum/*.enum.ts
    │       ├── dto/<name>.{result,command}.ts       ← 도메인 입출력 DTO
    │       ├── error/<name>.error.ts                ← 도메인 에러 (선택)
    │       ├── repository/<name>.repository.ts      ← abstract class (포트)
    │       └── service/<name>.service.ts            ← @Injectable, 순수 도메인 로직
    └── infrastructure/                              ← 외부 시스템 어댑터 (Composition Root)
        ├── infrastructure.module.ts                 ← @Global. 포트→impl 일괄 binding
        ├── prisma/                                  ← PrismaService + PrismaModule
        ├── auth/                                    ← contract 구현 (ScryptPasswordEncoder 등)
        └── repository/<ctx>/persistence/<name>.repository.impl.ts
```

### 1-2. 의존 방향 (절대 어기지 말 것)

```
interfaces ──► application ──► domain ◄── infrastructure
```

- `domain/**` 은 `infrastructure/**`, `interfaces/**`, `application/**`, `@prisma/client`, `xrpl` 같은 외부 라이브러리를 **import 하지 않는다**. (`@nestjs/common` 의 데코레이터는 허용)
- `interfaces/**` 는 `infrastructure/**` 의 어떤 파일도 직접 import 하지 않는다. 모든 wiring 은 `InfrastructureModule` 이 담당한다.
- 모든 레이어가 `domain/common/error/{DomainError,ErrorCode}` 를 참조해 에러를 던진다 (도메인 횡단 공통 모듈). interfaces 의 `ApiException` 같은 별도 클래스는 없다.
- 같은 레이어 안에서도 **다른 bounded context (`<ctx>`) 의 내부 파일을 직접 import 하지 않는다**. 컨텍스트 간 호출은 facade 또는 `domain/<ctx>/service` 를 통해서만.

### 1-3. 호출 흐름 (한 줄 요약)

```
controller → facade → service → repository (port) → repository.impl (adapter)
                       ↑
                       ↑ entity / dto / enum / error 만 사용
```

---

## 2. 참조 패턴 — 한 API 가 만들어내는 파일 세트

새 API 를 추가할 때는 **아래 파일 세트를 그대로 복제하고 `<ctx>` / `<name>` 자리만 바꾼다.**
실제로 어떻게 생겼는지는 작업 시점에 `src/app/interfaces/` 아래에 존재하는 모듈 중 하나를 열어 본다.

| 역할 | 경로 |
|---|---|
| Controller | `src/app/interfaces/<ctx>/controller/<ctx>.controller.ts` |
| Module | `src/app/interfaces/<ctx>/<ctx>.module.ts` |
| Req DTO | `src/app/interfaces/<ctx>/req/<name>.req.ts` |
| Res DTO + 매퍼 | `src/app/interfaces/<ctx>/res/<name>.res.ts` |
| Swagger 데코레이터 | `src/app/interfaces/<ctx>/swagger/<ctx>.swagger.api.ts` |
| (선택) 가드 / current-user | `src/app/interfaces/<ctx>/auth/*.ts` |
| Facade | `src/app/application/<ctx>.facade.ts` |
| Domain Service | `src/app/domain/<ctx>/service/<name>.service.ts` |
| Repository (port) | `src/app/domain/<ctx>/repository/<name>.repository.ts` |
| Repository (impl) | `src/app/infrastructure/repository/<ctx>/persistence/<name>.repository.impl.ts` |
| Entity | `src/app/domain/<ctx>/entity/<name>.entity.ts` |
| Domain DTO | `src/app/domain/<ctx>/dto/<name>.{command,result}.ts` |
| Enum | `src/app/domain/<ctx>/enum/<name>.enum.ts` |
| (선택) Domain Error | `src/app/domain/<ctx>/error/<name>.error.ts` |
| 포트→impl binding | `src/app/infrastructure/infrastructure.module.ts` |
| 루트 모듈 등록 | `src/app.module.ts` |

> 작업 직전에 현존 모듈 하나를 골라 위 파일들을 읽고 같은 패턴으로 작성한다. 다른 패턴으로 짜지 말 것.

---

## 3. 새 API 추가 체크리스트

새 엔드포인트를 추가할 때 아래 순서대로 작업한다 (역방향 — 도메인부터, 인터페이스가 마지막).

1. **Domain entity** `domain/<ctx>/entity/<name>.entity.ts`
   - 순수 클래스. `public readonly` 필드. 외부 라이브러리 import 금지.
2. **Enum / Domain DTO / Domain Error** (필요한 만큼)
   - `dto/*.command.ts` = 입력 명령, `dto/*.result.ts` = 출력 결과.
3. **Repository port** `domain/<ctx>/repository/<name>.repository.ts`
   - `export abstract class XRepository { abstract method(...): Promise<...> }`
4. **Domain service** `domain/<ctx>/service/<name>.service.ts`
   - `@Injectable()`. repository 포트만 주입. 외부 lib 모름.
5. **Repository impl** `infrastructure/repository/<ctx>/persistence/<name>.repository.impl.ts`
   - `@Injectable()`. `extends XRepository`. PrismaService 주입. Prisma row → 엔티티 변환은 private 매퍼로.
6. **InfrastructureModule** 에 `{ provide: XRepository, useClass: XRepositoryImpl }` 추가하고 `exports` 에도 추가.
7. **Facade** `application/<ctx>.facade.ts`
   - `@Injectable()`. **컨텍스트 단위 클래스** — 한 ctx 의 모든 유스케이스 메서드 (create · list · revoke …) 를 모은다. 도메인 서비스 여러 개를 오케스트레이션. **에러를 직접 throw 하지 않는다** — 검증은 도메인 서비스에 위임하고, 도메인 서비스가 던지는 `DomainError` 는 catch 없이 그대로 흘려보냄.
8. **Req DTO** `interfaces/<ctx>/req/<name>.req.ts`
   - `class-validator` 데코레이터로 검증. `@ApiProperty` 로 Swagger 예시.
9. **Res DTO** `interfaces/<ctx>/res/<name>.res.ts`
   - `static from(result: XResult): XRes` 정적 매퍼 필수. `@ApiProperty` 로 Swagger 예시.
10. **Swagger decorator** `interfaces/<ctx>/swagger/<ctx>.swagger.api.ts`
    - `XApiTags()`, `XSwaggerApi()` 형태로 export. `ApiCommonRes(XRes)` 사용.
11. **Controller** `interfaces/<ctx>/controller/<ctx>.controller.ts`
    - 얇게. `facade.method()` 한 번 호출 → `CommonRes.success(XRes.from(result))`.
12. **Module** `interfaces/<ctx>/<ctx>.module.ts`
    - `controllers: [...]`, `providers: [도메인 서비스들, Facade, 가드]`, `exports: [Facade]`.
13. **AppModule** 에 새 모듈 import.

---

## 4. 코딩 규칙

### 4-1. 응답 포맷
- **모든 컨트롤러**는 `CommonRes<T>` 로 감싼 응답을 반환한다.
- 성공: `CommonRes.success(data)` — `{ success: true, code: null, message: null, data }`
- 실패: 어디서든 `DomainError` 를 던지면 `ApiExceptionHandler` 가 `CommonRes.fail(...)` 로 변환.

### 4-2. 에러 처리 (공통 에러 모델)
- **단일 에러 클래스**: `domain/common/error/domain.error.ts` 의 `DomainError`. 도메인·application·interfaces 어디서든 이 클래스 하나만 throw.
- **단일 카탈로그**: `domain/common/error/error-code.ts` 의 `ErrorCode`. 그룹 (Common · Auth · User · Document …) 별로 정의된 값 객체. 새 에러는 여기에 한 줄 추가.
  ```ts
  throw new DomainError(ErrorCode.User.USER_NOT_FOUND, { userId: id.toString() });
  ```
- **글로벌 필터 한 분기**: `ApiExceptionHandler` 가 `instanceof DomainError` 한 번만 체크. `errorCode.httpStatus` · `errorCode.code` · `errorCode.message` + `data` 를 그대로 응답에 매핑. **새 에러 추가 시 핸들러 손댈 필요 없음.**
- 컨텍스트별 에러 클래스(`<name>.error.ts`) · `ApiException` · `mapXError` 같은 패턴 사용 안 함.

### 4-3. Swagger
- 컨트롤러 핸들러에는 비즈니스 데코레이터를 직접 달지 않고 `swagger/*.swagger.api.ts` 의 합성 데코레이터를 단다.
- 응답 schema 는 `ApiCommonRes(XRes)` 사용 — `CommonRes<T>` 의 `data` 필드를 정확히 표현해줌.

### 4-4. 엔티티 / Prisma 분리
- `@prisma/client` import 는 **`infrastructure/repository/**/persistence/*.impl.ts` 안에서만** 허용.
- repository.impl 은 Prisma row → 도메인 엔티티 변환을 private 매퍼 (`toXEntity(row)`) 로 처리.
- 도메인 엔티티는 Prisma 타입을 노출하지 않는다.

### 4-5. Prisma / DB
- DB 스키마는 외부 소유. `prisma migrate` **금지**. `prisma db pull` + `prisma generate` 만 사용.
- Prisma 모델명은 `@@map("snake_case_table")` 으로 실제 테이블에 매핑.
- 트랜잭션이 필요하면 `prisma.$transaction(async (tx) => ...)` 패턴 사용.

### 4-6. 인증
- 보호 라우트는 `@UseGuards(<X>JwtGuard)` + `@Current<X>() x: <X>` 형태의 데코레이터 페어를 `interfaces/<ctx>/auth/` 에 두고 사용한다.
- 토큰 발급/검증은 도메인 contract (`domain/common/contract/token-provider.ts` 같은 포트) → `infrastructure/auth/` 구현으로 연결.
- 새 인증 방식이 필요하면 `domain/common/contract/` 에 포트 추가 → `infrastructure/auth/` 에 구현 → `InfrastructureModule` 에 binding.

### 4-7. 네이밍
- 파일: `kebab-case`. 클래스: `PascalCase`. enum 값: `UPPER_SNAKE`.
- Req / Res suffix: `*.req.ts` / `*.res.ts`. Domain DTO: `*.command.ts` / `*.result.ts`.
- Repository: 포트는 `*.repository.ts`, 어댑터는 `*.repository.impl.ts`.

---

## 5. 하지 말 것

- ❌ 컨트롤러에서 PrismaService / repository 직접 주입
- ❌ `interfaces/**` 에서 `infrastructure/**` import
- ❌ `domain/**` 에서 `@prisma/client`, `xrpl`, `@nestjs/swagger`, `class-validator` 등 import
- ❌ 응답을 `CommonRes` 로 감싸지 않고 raw 반환
- ❌ 컨텍스트별 에러 클래스 (`<ctx>.error.ts`) 따로 만들기 — 모든 에러는 `DomainError + ErrorCode.<Group>.<NAME>` 조합으로 표현
- ❌ facade 에 try/catch + private 매퍼 — 도메인 에러는 그대로 흘려보내야 함
- ❌ repository 구현체에서 도메인 엔티티 대신 Prisma row 를 그대로 반환
- ❌ 같은 레이어 안에서 다른 bounded context 의 내부 파일 직접 import (`domain/<ctx-a>/...` 에서 `domain/<ctx-b>/repository/...` 같은 직접 의존 X — `domain/<ctx-b>/service/*` 단위로만 호출)
- ❌ 새 슬래시 명령·hooks 사용 없이 위 트리를 임의 변형

---

## 6. 빌드 / 테스트 / 검증

```bash
npm run build          # tsc/nest build — 새 코드 컴파일 확인
npm run lint           # ESLint --fix
npm test               # jest unit
npm run prisma:generate
```

PR 전에 최소 `npm run build` + `npm run lint` 통과 확인.

---

## 7. 작업 시 AI 행동 원칙

1. **수정 전에 현존 모듈 하나를 골라 §2 의 파일 세트를 끝까지 읽는다** — 패턴이 헷갈리면 살아있는 코드가 정답. 특정 도메인 이름에 의존하는 예시는 신뢰하지 않는다.
2. **체크리스트 (§3) 순서대로** — 도메인부터, 인터페이스가 마지막.
3. 새 파일은 반드시 §1-1 의 디렉터리 위치에. 위치가 모호하면 작업을 멈추고 질문.
4. DB 스키마 변경이 필요하면 작업을 멈추고 사용자에게 알린다 — `prisma migrate` 자동 실행 금지.
5. 컨텍스트 (`<ctx>`) 를 새로 만들 때는 사용자에게 이름을 확인받는다.
