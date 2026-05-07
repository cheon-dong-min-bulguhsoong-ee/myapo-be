# AI Harness & Spec-Driven Engineering Manifest

## 0. Entry Point (SYSTEM_ROOT)
This directory is the **Source of Truth** for all domain modeling. AI agents MUST initialize every task by reading this manifest to locate the target domain's specifications.

## 1. Domain Map (Actionable Index)
Use these paths to jump directly to domain logic. **Rule: Always read `glossary.md` before `apis/` or `modules/`.**

| ID | Domain | Base Path | Key Entry Point |
| :--- | :--- | :--- | :--- |
| `DOM_ADM` | Admin | `./admin/` | `requirements/`, `apis/` |
| `DOM_AUT` | Auth | `./auth/` | `requirements/`, `apis/` |
| `DOM_CRD` | Credential | `./credential/` | `requirements/`, `apis/` |
| `DOM_DSP` | Dispute | `./dispute/` | `requirements/`, `apis/` |
| `DOM_DOC` | Document | `./document/` | `requirements/`, `apis/` |
| `DOM_ESC` | Escrow | `./escrow/` | `requirements/`, `apis/` |
| `DOM_SET` | Settlement | `./settlement/` | `requirements/`, `apis/` |
| `DOM_USR` | User | `./user/` | `requirements/`, `apis/` |
| `DOM_SHR` | Shared | `./shared/` | `connectivity.md`, `events.md` |

## 2. Standardized Spec Schema
AI agents MUST follow this traversal order for deterministic implementation:
1.  **`glossary.md`**: Sync Ubiquitous Language (Stakeholder-Aligned).
2.  **`requirements/*.md`**: Extract functional rules (Gherkin) & constraints.
3.  **`apis/*.md`**: Map API Contracts (OpenAPI YAML).
4.  **`modules/*.md`**: Define Service Flows & Domain Entities.
5.  **`test-cases/*.md`**: Validate against acceptance criteria (TDD).

## 3. Operational Protocol
All AI agents MUST adhere to the [**Spec-Driven Engineering Workflow**](./agent-workflow.md) for every implementation task.

## 4. Maintenance Rule
- **Outdated Specs**: If you find a conflict between implementation and spec, ask: "Should I update the Spec or the Code?".
- **New Domains**: Copy `.template/` to create a new domain structure.
- **Bootstrapping**: Refer to the "Exception Handling" section in the [agent-workflow](./agent-workflow.md) if specs are missing.
