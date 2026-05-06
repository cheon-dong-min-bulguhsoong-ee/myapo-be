# Spec-Driven Engineering Workflow

This document defines the operational protocol for AI agents to ensure deterministic, spec-driven development.

## 1. Phase 1: Context Synchronization (Linguistic Alignment)
Before writing any code, the agent MUST synchronize its internal model with the domain's language.

1.  **Read `glossary.md`**: Identify the "Business Term" vs "System Key" mappings.
2.  **Enforce Hallucination Guards**: Check for forbidden terms and mandatory naming conventions (e.g., ID prefixes).
3.  **Validate Context**: If any term is ambiguous, ask the user for clarification before proceeding.

## 2. Phase 2: Behavioral Analysis (Requirement Grounding)
Understand the "What" and the "Rules" using structured specifications.

1.  **Read `requirements/functional.md`**: Parse Gherkin (Given/When/Then) scenarios to understand the expected behaviors.
2.  **Read `requirements/constraints.md`**: Extract strict business invariants (`BR_xxx`) and technical limits.
3.  **Cross-Check**: Ensure the domain entity invariants in `modules/domain.md` align with the business rules.

## 3. Phase 3: Structural Mapping (Implementation Blueprint)
Map the requirements to the system architecture.

1.  **API Contract (`apis/spec.md`)**: Use the OpenAPI YAML block as the definitive guide for DTOs and Controller endpoints.
2.  **Service Flow (`modules/usecase.md`)**: Follow the step-by-step sequence of domain logic, persistence, and side effects.
3.  **Event Pub/Sub (`modules/events.md`)**: Identify if this task requires publishing new events or subscribing to existing ones.

## 4. Phase 4: Implementation & Validation (TDD)
1.  **Draft Tests**: Generate unit and integration test skeletons based on `test-cases/*.md`.
2.  **Code Generation**: Implement the domain logic, use cases, and interfaces strictly following the blueprint.
3.  **Verification**: Run tests. If a test fails, re-verify the code against the Spec. **The Spec is the Authority.**

## 5. Exception Handling: Missing or Empty Specs
If a domain is not in the [Domain Map](MANIFEST.md#1-domain-map-actionable-index) or spec files are empty/placeholders:

1.  **Stop Execution**: Do NOT proceed with code implementation.
2.  **Query User**: Request the following:
    - Core Responsibility of the domain.
    - 3-5 Critical Business Rules.
    - Key Interfaces/APIs required.
3.  **Bootstrap**: Use `.template/` to draft new spec files based on the user's input.
4.  **Confirm**: Obtain user approval of the draft before proceeding to Phase 1.
