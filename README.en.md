# MyApoBE

This is the backend repository of “MyApo,” a certification and tracking service that issues Apostille standards for XRPL.

- Korean Version: [Click this!](./README.md)

---

## Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15+ |
| API Doc | Swagger / OpenAPI | 3.0 |

---

## AI Agent Context

This project uses a structured context system for AI agents (Gemini, Claude, etc.) to ensure architectural consistency and spec-driven development.

Every AI session must start by reading the Control Plane:
[.ai-agent-context/.orchestrator.md](./.ai-agent-context/.orchestrator.md)

### Context Structure
- Rules (.ai-agent-context/rules/): The single source of truth for architectural mandates, coding conventions, naming rules, and testing strategies.
- Specs (.ai-agent-context/specs/): Domain-driven design specifications, ubiquitous language, and API contracts.
- ADRs (.ai-agent-context/adrs/): Architectural Decision Records documenting the "Why" behind technical choices.
- References (.ai-agent-context/references/): External standards (XRPL, W3C) and technical documentation.

---

## Environment Setup

1. Copy Environment Template
   ```bash
   cp .env.example .env
   ```

2. Configure Database Connection
   Edit .env with your PostgreSQL credentials:
   ```text
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<NAME>?schema=<SCHEMA>"
   PORT=4000
   NODE_ENV=development
   ```

3. URL Encoding for Special Characters
   If your password contains special characters, you must URL-encode them:
   - # -> %23
   - $ -> %24
   - @ -> %40

---

## Cautions and Constraints

- No prisma migrate: The database schema is managed externally. Use prisma db pull to sync and prisma generate to update the client.
- Dependency Direction: Strictly follow the rule: Interfaces -> Application -> Domain <- Infrastructure.
- Error Model: Use the unified DomainError + ErrorCode model defined in rules/conventions/coding-convention.md.
- Database Permissions: Ensure the user has proper GRANT permissions on the schema and sequences.

---

## Getting Started

### Installation and Build
```bash
npm install
npx prisma generate
npm run build
```

### Run Commands
| Mode | Command |
| :--- | :--- |
| Development | npm run start:dev (Watch mode) |
| One-shot | npm run start |
| Production | npm run build && npm run start:prod |

### API Documentation
- Swagger UI: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/docs-json
- Auth: Use the Authorize button in Swagger UI to provide a Bearer JWT.

---

## Scripts Reference

| Script | Description |
| :--- | :--- |
| npm run lint | Run ESLint with automatic fixes |
| npm run format | Format code using Prettier |
| npm test | Run Jest unit tests |
| npm run test:e2e | Run Jest E2E tests |
| npm run prisma:pull | Sync local schema from remote DB |
| npm run prisma:studio | Open Prisma Studio GUI |
