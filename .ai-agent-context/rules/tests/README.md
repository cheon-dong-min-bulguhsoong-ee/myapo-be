---
name: tests-strategy
description: Comprehensive guide for testing, TDD, and mocking strategies. Use this as the entry point for understanding how to verify code changes in the MyApoBE project.
---

# Testing & TDD Strategy

This guide outlines the project's approach to quality assurance, emphasizing behavior-driven testing and maintainable test structures.

## 1. Core Philosophy

**Tests must verify behavior, not implementation.** The internal structure of the code can change entirely, but as long as the behavior remains the same, the tests should stay green.

### 1.1 Good Tests (Integration-Style)
- **Focus**: Observable behavior through public APIs (what the system does).
- **Survival**: They survive internal refactors because they aren't coupled to private methods or internal state.
- **Documentation**: They read like a specification of capabilities (e.g., "user can checkout with valid cart").

### 1.2 Mocking Strategy (Mock only at Boundaries)
- **Mock at System Boundaries**: External APIs, Time, File System, and sometimes Databases (prefer real test DBs).
- **Do NOT Mock Internal Parts**: Never mock your own classes, modules, or internal collaborators.
- **Interface/Port Mocking**: Always mock interfaces (Ports) rather than concrete implementations to keep tests decoupled.
- See [mocking.md](./mocking.md) for detailed guidelines.

## 2. TDD & Implementation Workflow

We follow a **Vertical Slicing** approach. Do NOT write all tests first and then all code. Instead, implement one behavior at a time.

### 2.1 The Vertical Slice (Tracer Bullet)
1. **RED**: Write ONE test for the first behavior → Test fails.
2. **GREEN**: Write the minimal code to pass → Test passes.
3. **REFACTOR**: Improve the code while keeping the test green.
4. **REPEAT**: Move to the next behavior.

See [tdd.md](./tdd.md) for the mandatory execution flow.

## 3. Design for Testability

Testing is easier when the code is designed for it. Follow these specific guidelines:
- [Function Design](./function-design.md): Pure functions, dependency injection via arguments.
- [Class Design](./class-design.md): Constructor injection, favor composition, small interfaces.

## 4. Documentation Index

Detailed rules and procedures are organized as follows:

- **[Testing & Validation](./testing.md)**: Project commands (Build/Lint/Test), validation loops, and completion requirements.
- **[TDD Flow](./tdd.md)**: Mandatory red-green-refactor steps and implementation rules.
- **[Mocking Guidelines](./mocking.md)**: Where and how to mock, designing for mockability.
- **[Function Design](./function-design.md)** & **[Class Design](./class-design.md)**: Principles for writing testable code.
- **[Refactoring](./refactoring.md)**: Guidelines for safe code improvement.

## 5. Checklist Per Cycle

```
[ ] Test describes BEHAVIOR, not implementation.
[ ] Test uses public interface only.
[ ] External dependencies are mocked at the boundary (Port/Interface).
[ ] No implementation details (private methods, internal calls) are mocked.
[ ] Code is the absolute minimal to pass the current test.
[ ] All validation checks (Build, Lint, Type-check) are green.
```
