# Architecture — Clean Layered

This project follows a combination of Clean and Layered Architecture principles to ensure maintainability and scalability.

## 1. Layers and Directory Structure

```
src/
├── main.ts                                          <-- Bootstrapping + ValidationPipe + Swagger
├── app.module.ts                                    <-- Root module. Imports only interface modules
└── app/
    ├── interfaces/                                  <-- HTTP Entry points (Thin layer)
    │   ├── common/                                  <-- CommonRes, ApiCommonRes, CommonModule
    │   ├── exception/                               <-- ApiException, ExceptionCode, ApiExceptionHandler
    │   └── <ctx>/
    │       ├── controller/<name>.controller.ts      <-- Validation & Mapping only, no business logic
    │       ├── req/<name>.req.ts                    <-- Input validation with class-validator
    │       ├── res/<name>.res.ts                    <-- Output mapping with static from(result)
    │       ├── swagger/<ctx>.swagger.api.ts         <-- Collection of @ApiOperation/@ApiResponse
    │       ├── auth/                                <-- (Optional) Guards & current-user decorators
    │       └── <ctx>.module.ts                      <-- Controllers + Facade + Domain Services + Guards
    ├── application/
    │   └── <name>.facade.ts                         <-- Usecase orchestration
    ├── domain/                                      <-- No external library dependencies (Nest decorators allowed)
    │   ├── common/
    │   │   ├── contract/<port>.ts                   <-- Cross-domain ports (e.g., PasswordEncoder)
    │   │   └── enum/*.enum.ts
    │   └── <ctx>/
    │       ├── entity/<name>.entity.ts              <-- Pure classes. readonly fields + domain methods
    │       ├── enum/*.enum.ts
    │       ├── dto/<name>.{result,command}.ts       <-- Domain I/O DTOs
    │       ├── error/<name>.error.ts                <-- Domain-specific errors (Optional)
    │       ├── repository/<name>.repository.ts      <-- Abstract class (Port)
    │       └── service/<name>.service.ts            <-- @Injectable, pure domain logic
    └── infrastructure/                              <-- External system adapters (Composition Root)
        ├── infrastructure.module.ts                 <-- @Global. Port-to-Impl binding
        ├── prisma/                                  <-- PrismaService + PrismaModule
        ├── auth/                                    <-- Contract implementations
        └── repository/<ctx>/persistence/<name>.repository.impl.ts
```

## 2. Dependency Rules

### 2-1. Dependency Direction
```
interfaces --> application --> domain <-- infrastructure
```

- **Domain Isolation**: `domain/**` must not import anything from `infrastructure/**`, `interfaces/**`, `application/**`, or external libraries like `@prisma/client` or `xrpl`. Only `@nestjs/common` decorators are allowed.
- **Interface Restrictions**: `interfaces/**` must not directly import files from `infrastructure/**`. All wiring is handled by the `InfrastructureModule`.
- **Application Responsibility**: `application/**` may use `ApiException` or `ExceptionCode` from `interfaces/exception/*` to map domain errors to HTTP errors.
- **Context Isolation**: Do not import internal files from other bounded contexts (`<ctx>`) even within the same layer. Inter-context calls must go through the Facade or `domain/<ctx>/service`.

### 2-2. Execution Flow
```
controller -> facade -> service -> repository (port) -> repository.impl (adapter)
                       ^
                       | Uses only entity / dto / enum / error
```

## 3. Reference Patterns - API File Set

When adding a new API, replicate the following file set. Refer to existing modules in `src/app/interfaces/` for implementation details.

| Role | Path |
|---|---|
| Controller | `src/app/interfaces/<ctx>/controller/<ctx>.controller.ts` |
| Module | `src/app/interfaces/<ctx>/<ctx>.module.ts` |
| Req DTO | `src/app/interfaces/<ctx>/req/<name>.req.ts` |
| Res DTO + Mapper | `src/app/interfaces/<ctx>/res/<name>.res.ts` |
| Swagger Decorator | `src/app/interfaces/<ctx>/swagger/<ctx>.swagger.api.ts` |
| (Optional) Guard / Current User | `src/app/interfaces/<ctx>/auth/*.ts` |
| Facade | `src/app/application/<name>.facade.ts` |
| Domain Service | `src/app/domain/<ctx>/service/<name>.service.ts` |
| Repository (port) | `src/app/domain/<ctx>/repository/<name>.repository.ts` |
| Repository (impl) | `src/app/infrastructure/repository/<ctx>/persistence/<name>.repository.impl.ts` |
| Entity | `src/app/domain/<ctx>/entity/<name>.entity.ts` |
| Domain DTO | `src/app/domain/<ctx>/dto/<name>.{command,result}.ts` |
| Enum | `src/app/domain/<ctx>/enum/<name>.enum.ts` |
| (Optional) Domain Error | `src/app/domain/<ctx>/error/<name>.error.ts` |
| Port-to-Impl Binding | `src/app/infrastructure/infrastructure.module.ts` |
| Root Module Registration | `src/app.module.ts` |

## 4. API Addition Checklist

Follow this order (Domain first, Interfaces last):

1. **Domain entity**: `domain/<ctx>/entity/<name>.entity.ts`
2. **Enum / Domain DTO / Domain Error**: Define commands and results.
3. **Repository port**: `domain/<ctx>/repository/<name>.repository.ts` (abstract class)
4. **Domain service**: `@Injectable`, injects repository ports.
5. **Repository impl**: `infrastructure/repository/<ctx>/persistence/<name>.repository.impl.ts` (extends port, uses PrismaService)
6. **InfrastructureModule**: Add `{ provide: XRepository, useClass: XRepositoryImpl }` to providers and exports.
7. **Facade**: Orchestrates domain services and maps domain errors to `ApiException`.
8. **Req DTO**: Input validation and Swagger documentation.
9. **Res DTO**: Output mapping with `static from()` and Swagger documentation.
10. **Swagger decorator**: Create composite decorators for controllers.
11. **Controller**: Thin implementation calling the Facade.
12. **Module**: Register controllers, providers, and exports.
13. **AppModule**: Import the new module.

## 5. Prohibited Actions

- Do not inject PrismaService or repository implementations directly into controllers.
- Do not import `infrastructure/**` from `interfaces/**`.
- Do not import `@prisma/client`, `xrpl`, `@nestjs/swagger`, or `class-validator` in `domain/**`.
- Do not return raw responses; always use `CommonRes`.
- Do not throw `ApiException` from domain services (map domain errors in the Facade).
- Do not return Prisma rows directly from repositories; map them to domain entities.
- Do not import internal files from other bounded contexts directly.
