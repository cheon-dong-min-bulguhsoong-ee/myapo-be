# Specification Index & Engineering Workflow

This document is the **Source of Truth** for all domain modeling and the operational protocol for AI agents.

---

## SYSTEM ENTRY POINT (READ FIRST)

This directory is the absolute authority for domain logic. AI agents MUST initialize every task by reading this index to locate the target domain's specifications.

---

## DOMAIN MAP (ACTIONABLE INDEX)

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

---

## SPEC TRAVERSAL ORDER (CRITICAL)

AI agents MUST follow this traversal order for deterministic implementation:

0. **Reference Discovery**: Check `references/README.md` for external standards (XRPL, Web3Auth, etc.).
1. **`glossary.md`**: Sync Ubiquitous Language (Stakeholder-Aligned).
2. **`requirements/*.md`**: Extract functional rules (Gherkin) & constraints.
3. **`apis/*.md`**: Map API Contracts (OpenAPI YAML).
4. **`modules/*.md`**: Define Service Flows & Domain Entities.
5. **`test-cases/*.md`**: Validate against acceptance criteria (TDD).

---

## ENGINEERING WORKFLOW (MANDATORY)

### Phase 1: Context Synchronization
- **Reference Discovery**: Consult external standards.
- **Linguistic Alignment**: Map "Business Term" to "System Key" using `glossary.md`.
- **Hallucination Guards**: Enforce forbidden terms and naming conventions.

### Phase 2: Behavioral Analysis
- **Requirement Grounding**: Parse functional scenarios and business invariants.
- **Cross-Check**: Align domain entity invariants with business rules.

### Phase 3: Structural Mapping
- **API Blueprint**: Use OpenAPI YAML for DTOs and Controller endpoints.
- **Service Logic**: Follow step-by-step sequence in `modules/usecase.md`.
- **Event Schema**: Identify event publishing/subscription requirements.

### Phase 4: Implementation & Validation (TDD)
- **Draft Tests**: Generate skeletons based on `test-cases/*.md`.
- **Code Generation**: Implement strictly following the blueprint.
- **Final Verification**: Build, Lint, and Tests MUST pass.

---

## MAINTENANCE & BOOTSTRAPPING

- **Outdated Specs**: If implementation conflicts with spec, ASK: "Update Spec or Code?".
- **New Domains**: Copy `.template/` to create a new domain structure.
- **Missing Specs**: If a domain is missing or files are empty:
  1. **STOP** execution.
  2. **Query User** for core responsibility, 3-5 critical rules, and key APIs.
  3. **Bootstrap** new spec files using `.template/` and obtain approval.

---

## EXECUTION MODE

This document MUST be treated as:
- source of truth for domains
- mandatory traversal guide
- implementation authority

ALL spec-driven tasks MUST comply with this document.
