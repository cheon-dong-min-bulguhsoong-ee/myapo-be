# Test Driven Development (TDD)

Procedures and rules for implementing features and bug fixes using TDD.

## 1. TDD Execution Flow (Mandatory)

Before starting implementation:
1. **Read TDD Docs**: Read the impacted domain's `tdd.md` (e.g., `domains/X/tdd.md`).
2. **Extract Cases**: Extract specific test cases and requirements.
3. **Derive Components**: Identify required entities, services, or ports from the test cases.

Implementation Cycle:
1. **Minimal Code**: Implement the minimal code required to satisfy the test cases.
2. **Run Tests**: Execute the relevant tests.
3. **Fix & Refactor**: Resolve failures and refactor for cleanliness while maintaining green tests.
4. **Repeat**: Continue until all tests pass and all scenarios are covered.

## 2. Implementation Rules
- **Satisfy All Cases**: Implementation MUST satisfy all applicable test cases.
- **No Testless Implementation**: MUST NOT implement without test definition when a domain TDD specification exists.
- **Minimalism**: Focus on passing the defined tests before adding extra logic.
