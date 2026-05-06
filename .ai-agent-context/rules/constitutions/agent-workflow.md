# AI Agent Workflow

Guidelines and procedures for AI agent operations, task management, and document orchestration.

## 1. Core Principles

- **Control Plane**: `.orchestrator.md` serves as the global control plane for the entire system and must be referenced as the starting point for any operation.
- **Strict Compliance**: The agent must be fully aware of and strictly follow all rules documented under the `rules/` directory (including conventions and test strategies).
- **Ambiguity Protocol**: If instructions or documents are ambiguous, the agent **MUST** seek the user's opinion first without exception. Decisions or implementation plans should only be finalized after receiving user confirmation.

## 2. Task Classification & Selection

### 2.1 Task Classification
Classify the task first to determine document selection:
- **feature**: New functionality implementation.
- **bugfix**: Fixing reported issues or failures.
- **refactor**: Improving internal structure without changing behavior.
- **integration**: Connecting multiple domains or external systems.
- **migration**: Moving data or upgrading infrastructure/dependencies.
- **test-only**: Adding or updating tests.
- **docs-only**: Documentation updates.

### 2.2 Mandatory Baseline Documents
The following MUST be used for all tasks:
- `.ai-agent-context/rules/constitutions/agent-workflow.md` (this document)
- `.ai-agent-context/rules/conventions/software-architecture.md`
- `.ai-agent-context/rules/conventions/coding-convention.md`
- `.ai-agent-context/rules/conventions/naming-convention.md`
- `.ai-agent-context/rules/tests/testing.md`
- `.ai-agent-context/rules/tests/tdd.md`
- `.ai-agent-context/adrs/README.md`

### 2.3 Context-Specific Selection
- **Domain-Specific**: For any impacted domain `X`, load `domains/X/*.md` and `api/X/*.md`.
- **Cross-Domain**: If 2+ domains are touched, load `shared/events.md` and all impacted domains' docs.
- **API Changes**: If contracts/DTOs change, load relevant `api-spec.md` and `shared/events.md`.
- **Infra/Platform**: Load architecture rules and ADRs related to runtime, persistence, or messaging.

## 3. Execution Workflow

### 3.1 Mandatory Steps
1. **Analyze & Classify**: Identify task class and impacted domains.
2. **Select & Load**: Select required documents and load them into context.
3. **Constraint Check**: Explicitly apply ADR, domain, and architecture constraints.
4. **Incremental Implementation**: Implement the solution in small, verifiable steps.
5. **Validation**: Run the full validation loop (Build, Lint, Test).
6. **Completion**: Persist final state and report status.

### 3.2 Document Loading Rule
- MUST explicitly load and reference document content.
- MUST NOT assume knowledge without reading the documents.
- MUST treat documents as the source of truth.

## 4. State Management

### 4.1 State Persistence
To support resumable execution, maintain progress in:
`.human-llm-interaction/state.json`

### 4.2 State Structure
```json
{
  "currentTask": "Description",
  "taskClass": "feature|bugfix|...",
  "impactedDomains": ["user", "issuer"],
  "step": "implement",
  "completedSteps": ["analyze-task", "load-documents"],
  "selectedDocuments": ["software-architecture.md", "issuer/domain.md"],
  "artifacts": ["src/app/domain/issuer/issuer.entity.ts"]
}
```

### 4.3 Recovery Rules
If execution is interrupted:
1. Load `.human-llm-interaction/state.json`.
2. Identify the last completed step.
3. Resume from the next step.
4. **DO NOT** restart from the beginning or repeat completed steps.

## 5. Implementation Guidelines

### 5.1 Task Breakdown
Split large tasks into:
1. Contract/Interface updates.
2. Application/Use-case implementation.
3. Domain model/rules implementation.
4. Infrastructure implementation.
5. Integration/Verification.

### 5.2 Incremental Implementation
- Implement in small steps.
- Validate each step before proceeding.
- **DO NOT** generate the entire system at once.

### 5.3 Failure Handling
If ambiguity occurs:
- Prefer ADR over domain rules.
- Prefer domain rules over assumptions.
- **MUST discuss with the user before proceeding (as stated in Core Principles).**
- Final consensus and detailed plans MUST be recorded as a new ADR.

## 6. Output & Reporting
After completion, report the following:
- Task class and impacted domains.
- Selected documents used.
- Final Status: Build, Lint, Type-check, and Test results.
- Number of fixes applied during the validation loop.
