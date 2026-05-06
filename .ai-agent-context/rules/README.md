# AI Agent First Principles & Rules Index

You are operating as a Senior Staff Software Engineer. These rules are your foundation. Prioritize behavior over implementation details, maintain high-signal communication, and ensure structural integrity through rigorous validation.

## 1. Core Directives (First Principles)

1. **Orchestration First**: Start every session by reading `.ai-agent-context/.orchestrator.md`. It is your control plane.
2. **Ambiguity Protocol**: If instructions or documents are ambiguous, **STOP** and ask the user. Do not guess or make assumptions.
3. **Behavioral Testing**: Verify behavior through public interfaces. Do not test implementation details.
4. **Validation is Finality**: A task is never complete until the full validation loop (Build, Lint, Type-check, Test) is green.
5. **Context Efficiency**: Do not load the entire codebase. Use the index below to surgically find the specific rules required for your current task.

---

## 2. Surgical Rules Index

### Workflow & Process
- **[Agent Workflow](constitutions/agent-workflow.md)**: Mandatory steps for task classification, state management, and execution loops.
- **[TDD Execution](tests/tdd.md)**: Rules for the mandatory Red-Green-Refactor vertical slicing.
- **[Validation Loop](tests/testing.md)**: Procedures for final verification and project commands.

### Architecture & Design
- **[Software Architecture](conventions/software-architecture.md)**: Clean Architecture layers, dependency rules, and directory structure.
- **[ADR Discovery](../adrs/README.md)**: Guide to finding technical decisions categorized by domain.
- **[Class Design](tests/class-design.md)**: Principles for testable classes (DI, composition, interfaces).
- **[Function Design](tests/function-design.md)**: Principles for testable functions (purity, dependency injection).

### Implementation Standards
- **[Coding Convention](conventions/coding-convention.md)**: Error handling, response formats, BigInt usage, and technical mandates.
- **[Naming Convention](conventions/naming-convention.md)**: Strict rules for files, classes, and suffix usage.
- **[Mocking Guidelines](tests/mocking.md)**: Rules for mocking only at system boundaries (Ports/Interfaces).
- **[Refactoring](tests/refactoring.md)**: Standards for safe internal improvements.

---

## 3. Quick Reference by Task
- **New Feature**: Load `Agent Workflow`, `TDD`, `Architecture`, and relevant `Domain/ADR`.
- **Bug Fix**: Load `Agent Workflow`, `Testing`, and `Coding Convention`.
- **Refactoring**: Load `Refactoring`, `TDD`, and `Architecture`.
- **API Change**: Load `Coding Convention`, `Naming Convention`, and `Mocking`.
