# Naming Conventions

Standardized naming rules for files, classes, and variables.

## 1. General Rules
- **Files**: Use `kebab-case.ts`.
- **Classes**: Use `PascalCase`.
- **Enum values**: Use `UPPER_SNAKE_CASE`.

## 2. Layer Specific Suffixes
- **Interfaces**:
  - Request DTOs: `*.req.ts`
  - Response DTOs: `*.res.ts`
- **Domain**:
  - Domain DTOs (Input): `*.command.ts`
  - Domain DTOs (Output): `*.result.ts`
  - Repository Ports: `*.repository.ts`
- **Infrastructure**:
  - Repository Adapters: `*.repository.impl.ts`
