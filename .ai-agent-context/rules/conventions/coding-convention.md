# Coding Conventions

General coding standards and patterns for the project.

## 1. Architectural Mandates
- **Clean Architecture**: MUST follow Hexagonal/Clean Architecture layers (Domain, Application, Infrastructure, Interfaces).
- **Domain Boundaries**: MUST respect domain boundaries; cross-domain communication must use defined ports or events.
- **Dependency Rules**: Dependencies MUST point inwards (Interfaces -> Application -> Domain; Infrastructure -> Application/Domain).

## 2. Technical Constraints (ADR Mandates)

### 2.1 Value Representation
- **Values**: MUST use `BigInt` or `Decimal(78,0)` for all asset values to prevent precision loss.

### 2.2 Concurrency & State
- **Concurrency (ADR-007)**: MUST NOT update balances if `incoming_block < lastUpdatedBlock`.
- **Reorg (ADR-010)**: MUST set `is_reorganizing = true` in a separate transaction before rolling back state.

### 2.3 Storage & Batching
- **Storage (ADR-008, ADR-013)**: New tables and queries MUST support partitioning and 45-day pruning.
- **Batching (ADR-012)**: Backfill batch size MUST be calculated as `BASE_BATCH_SIZE / Active_Workers`.

## 3. Response Format
- All controllers must return responses wrapped in `CommonRes<T>`.
- Success: `CommonRes.success(data)` -> `{ success: true, code: null, message: null, data }`
- Failure: Any `DomainError` thrown will be automatically converted to `CommonRes.fail(...)` by the `ApiExceptionHandler`.

## 4. Error Handling (Common Error Model)
- **Single Error Class**: Use `DomainError` from `domain/common/error/domain.error.ts`. This single class is used across all layers (Domain, Application, Interfaces).
- **Single Catalog**: Use `ErrorCode` from `domain/common/error/error-code.ts`. Errors are categorized by groups (Common, Auth, User, Document, etc.).
- **Global Handler**: The `ApiExceptionHandler` checks for `instanceof DomainError` and maps the `ErrorCode` (HTTP status, code, message) and optional data directly to the response.
- **Prohibited**: Do NOT create context-specific error classes (e.g., `<name>.error.ts`) or use `ApiException`. Do NOT use try/catch in Facades to map errors; let `DomainError` flow to the global handler.

Example:
```ts
throw new DomainError(ErrorCode.User.USER_NOT_FOUND, { userId: id.toString() });
```

## 5. Swagger
- Use composite decorators from `swagger/*.swagger.api.ts` instead of direct handlers in controllers.
- Use `ApiCommonRes(XRes)` for the response schema to correctly represent the `data` field in `CommonRes<T>`.


## 6. Persistence & Prisma
- Importing `@prisma/client` is ONLY allowed in `infrastructure/repository/**/persistence/*.impl.ts`.
- Mappers must be used to convert Prisma models to domain entities.
- Running `prisma migrate` is strictly prohibited. Only `prisma db pull` and `prisma generate` are allowed.
- Use snake_case for tables via `@@map`.

## 7. Authentication
- Use `@UseGuards(<X>JwtGuard)` and `@Current<X>()` from `interfaces/<ctx>/auth/`.
- New methods require a port in `domain/common/contract/` and an implementation in `infrastructure/auth/`.

