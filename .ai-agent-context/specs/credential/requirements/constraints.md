# Credential Constraints

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Primary Sources**: Wireframe v4 files under `frontend/wireframe/v4` in `IDEATION-scaffold`.

## 1. Business Rules & Invariants

| ID | Rule Description | Source Level | Enforcement Level |
| :--- | :--- | :--- | :--- |
| `BR_CRD_001` | A credential belongs to exactly one user wallet owner. | Wireframe Evidence | Strict Block |
| `BR_CRD_002` | A credential must be linked to an issuance request and document type. | Spec Inference | Strict Block |
| `BR_CRD_003` | Issuance cannot complete until all required handover user signatures are recorded. | Wireframe Evidence | Strict Block |
| `BR_CRD_004` | The MVP handover model uses four user-signature handovers unless a persona/document spec overrides it. | Wireframe Evidence | Strict Block after approval |
| `BR_CRD_005` | A credential can be reused only before expiration. | Wireframe Evidence | Strict Block |
| `BR_CRD_006` | Expired credentials must not be submitted to institutions. | Wireframe Evidence | Strict Block |
| `BR_CRD_007` | Revoked credentials must not be submitted to institutions. | Wireframe Evidence | Strict Block |
| `BR_CRD_008` | User submission is allowed only for an existing institution submission request. | Wireframe Evidence | Strict Block |
| `BR_CRD_009` | One credential may have multiple institution submission history rows. | Wireframe Evidence | Allow |
| `BR_CRD_010` | Expiration triggers credential deletion/revocation, source deletion request, and key destruction request if those integrations are available. | Wireframe Evidence | Strict Block for lifecycle, integration may be async |
| `BR_CRD_011` | Dispute resolution may revoke or reissue a credential. | Wireframe Evidence | Operator Controlled |
| `BR_CRD_012` | Credential records must retain enough metadata to audit handover chain and submission history. | Wireframe Evidence | Strict Block |
| `BR_CRD_013` | The backend must not report real production XRPL settlement/finality while using the mock/testnet flow. | Wireframe Evidence | Strict Block |
| `BR_CRD_014` | Users can access only their own credentials unless an operator/admin API is explicitly specified. | Spec Inference | Strict Block |
| `BR_CRD_015` | Raw source document files and private keys must not be exposed through Credential APIs. | Spec Inference | Strict Block |

## 2. Technical Constraints

| Category | Constraint | Source Level | Rationale |
| :--- | :--- | :--- | :--- |
| Architecture | Follow Clean Layered Architecture: controller, req, res, swagger, facade, service, repository port, repository impl, module, app.module registration. | Existing Rule | Required by `.ai-agent-context` architecture. |
| Response | All API responses must be wrapped with `CommonRes<T>`. | Existing Rule | Project-wide response contract. |
| Error | Use only `DomainError` and `ErrorCode`. | Existing Rule | Project-wide error contract. |
| Domain Isolation | Domain must not import Prisma, Swagger, class-validator, interfaces, application, or infrastructure. | Existing Rule | Clean Architecture boundary. |
| Persistence | Prisma rows must be mapped to domain entities inside repository implementations. | Existing Rule | Prevent persistence model leakage. |
| XRPL | Real XRPL writes are out of scope for this draft; use mock/testnet metadata until an ADR/spec approves production integration. | Wireframe Evidence | Wireframe says `XRPL Credential Mock`. |
| Storage | Store references to encrypted source documents, not raw file bodies, unless a storage spec/ADR approves otherwise. | Spec Inference | Privacy and layer boundary. |
| Scheduling | Expiration handling may require a system job or explicit service method; exact scheduler is not defined in the wireframe. | Spec Inference | Needs implementation decision. |
| Cross-Domain | Document, User, Dispute, Issuer, and Institution interactions must go through facades, domain services, or ports, not internal file imports. | Existing Rule | Bounded context isolation. |
| Database | If new tables are needed, do not run Prisma migrate. Propose schema changes and ask the user. | Existing Rule | Project prohibits direct migration. |

## 3. Open Decisions Before Implementation

| ID | Question | Why It Matters |
| :--- | :--- | :--- |
| `OD_CRD_001` | Should Credential be a new Prisma model, or reuse/extend existing `Document` and `DocumentStage` models? | Determines persistence and repository design. |
| `OD_CRD_002` | Is four handover signatures always required, or does it vary by persona/document type? | Determines domain invariant and validation. |
| `OD_CRD_003` | What is the exact credential validity period per document type? | Required for expiration and reissue rules. |
| `OD_CRD_004` | Which actor creates institution submission requests? | Required for submission API ownership and authorization. |
| `OD_CRD_005` | What exact VC/XLS-70 payload fields are required in MVP? | Determines response schema and storage fields. |
| `OD_CRD_006` | Should expiration immediately mark `EXPIRED`, `REVOKED`, or both? | Determines lifecycle state machine. |
| `OD_CRD_007` | Which admin/operator APIs belong to Credential versus Dispute or Document domains? | Prevents bounded-context leakage. |
