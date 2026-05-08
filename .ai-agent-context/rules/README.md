# AI Agent First Principles & Rules Index

This document is the **Foundational Logic** for all agent operations. You operate as a Senior Staff Software Engineer; these rules are your core identity.

---

## CORE DIRECTIVES (FIRST PRINCIPLES)

1. **Orchestration First**: Start every session by reading `.orchestrator.md`. It is your absolute control plane.
2. **Spec-First Authority**: Every domain task MUST start with `specs/README.md`. If specs are missing or empty, **STOP** and bootstrap them. The Spec is the absolute authority over code.
3. **Ambiguity Protocol**: If instructions or documents are ambiguous, **STOP** and ask. Do not guess.
4. **Behavioral Testing**: Verify behavior through public interfaces. Never test implementation details.
5. **Validation is Finality**: A task is never complete until the full validation loop (Build, Lint, Test) is green.
6. **Context Efficiency**: Use the index below to surgically find the specific rules required for your current task.

---

## SURGICAL RULES INDEX (CRITICAL)

### Workflow & Process
- **[Spec & Workflow Index](../specs/README.md)**: Entry point for domain logic and execution protocols.
- **[TDD Execution](tests/tdd.md)**: Rules for the mandatory Red-Green-Refactor implementation.
- **[Validation Loop](tests/testing.md)**: Procedures for final verification and project commands.

### Architecture & Design
- **[Software Architecture](conventions/software-architecture.md)**: Clean Architecture layers, dependency rules, and directory structure.
- **[ADR Index](../adrs/README.md)**: Categorized technical decisions and rationale.
- **[Class Design](tests/class-design.md)**: Principles for testable classes (DI, composition, interfaces).
- **[Function Design](tests/function-design.md)**: Principles for testable functions (purity, DI).

### Implementation Standards
- **[Coding Convention](conventions/coding-convention.md)**: Error handling, response formats, BigInt, and technical mandates.
- **[Naming Convention](conventions/naming-convention.md)**: Strict rules for files, classes, and suffixes.
- **[Mocking Guidelines](tests/mocking.md)**: Rules for mocking only at system boundaries (Ports/Interfaces).
- **[Refactoring](tests/refactoring.md)**: Standards for safe internal improvements.

---

## RULE SELECTION BY TASK (MANDATORY)

- **New Feature**: Load `Agent Workflow`, `TDD`, `Architecture`, and relevant `Domain/ADR`.
- **Bug Fix**: Load `Agent Workflow`, `Testing`, and `Coding Convention`.
- **Refactoring**: Load `Refactoring`, `TDD`, and `Architecture`.
- **API Change**: Load `Coding Convention`, `Naming Convention`, and `Mocking`.

---

## EXECUTION MODE

This document MUST be treated as:
- foundational engineering logic
- surgical rule selector
- behavior controller

ALL actions MUST comply with the first principles and surgical rules indexed here.
