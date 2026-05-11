# Credential Constraints

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Primary Sources**:
  - `.ai-agent-context/references/frontend-design/Readme.md`
  - `.ai-agent-context/adrs/auth/adr-002-authentication-and-session-management.md`

## 1. Business Rules & Invariants

| ID | Rule Description | Source Level | Enforcement Level |
| :--- | :--- | :--- | :--- |
| `BR_CRD_001` | A credential belongs to exactly one user/wallet owner. | Reference Evidence | Strict Block |
| `BR_CRD_002` | Credential issuance is represented in the latest console as a 4-stage pipeline: 접수, 사전 검토, 번역/검수, 공증 서명, 발급 완료. | Reference Evidence | Strict Block |
| `BR_CRD_003` | Credential creation/user approval is not modeled as a separate substep in the credential pipeline. | Reference Evidence | Strict Block |
| `BR_CRD_004` | A credential may be submitted to multiple institutions; each submission is a separate row/record. | Reference Evidence | Strict Block |
| `BR_CRD_005` | Institution submission row status must support at least `received`, `verifying`, and `rejected`. | Reference Evidence | Strict Block |
| `BR_CRD_006` | Institution submission must retain submission metadata only; auth verification details belong to Auth/Document domains. | Reference Evidence | Strict Block |
| `BR_CRD_007` | Auth-gated heavy actions are limited to `issue_request`, `institution_submit`, and `dispute_report` unless Auth spec changes. | Reference Evidence | Strict Block |
| `BR_CRD_008` | Expired credentials must not be submitted to institutions. | Reference Evidence | Strict Block |
| `BR_CRD_009` | Revoked credentials must not be submitted to institutions. | Reference Evidence | Strict Block |
| `BR_CRD_010` | Rejected institution submissions can be converted to dispute with prefilled rejection context, but Dispute owns the dispute case. | Reference Evidence | Cross-Domain Boundary |
| `BR_CRD_011` | Credential-related protected APIs must use Internal JWT session strategy from ADR-002. | ADR Evidence | Strict Block |
| `BR_CRD_012` | Server must not store JWTs for Credential session tracking. | ADR Evidence | Strict Block |
| `BR_CRD_013` | MVP may use XRP Testnet transaction logs as hackathon evidence, but must not claim production/mainnet XRPL finality. | Hackathon Decision | Strict Block |
| `BR_CRD_014` | Raw source document files, CI originals, JWTs, and private keys must not be exposed through Credential APIs. | Reference + ADR Evidence | Strict Block |

## 2. Technical Constraints

| Category | Constraint | Source Level | Rationale |
| :--- | :--- | :--- | :--- |
| Architecture | Follow Clean Layered Architecture and context folders for any future code. | Existing Rule | Required by `.ai-agent-context`. |
| Response | All API responses must be wrapped with `CommonRes<T>`. | Existing Rule | Project-wide response contract. |
| Error | Use only `DomainError` and `ErrorCode`. | Existing Rule | Project-wide error contract. |
| Auth | New Credential APIs should use `JwtAuthGuard` / Internal JWT bearer security. | ADR Evidence | ADR-002 accepted stateless JWT session model. |
| Auth Fallback | `X-User-Id` may be documented only as legacy/test fallback if current living code requires it. | Spec Inference | Prevents new API contract drift. |
| Cross-Domain | Credential must reference AuthLog, Dispute, Document, User, and Institution by ids or ports/facades; it must not import internals directly. | Existing Rule | Bounded context isolation. |
| Pipeline | 4-stage issue pipeline must align with Document/console lifecycle; Credential may store projections but should not duplicate Document internals without an approved model decision. | Reference Evidence | Avoids conflicting workflow states. |
| Database | If new tables are needed, do not run Prisma migrate. Propose schema changes and ask the user. | Existing Rule | Project prohibits direct migration. |

## 3. Open Decisions Before Implementation

| ID | Question | Latest Recommendation | Why It Matters |
| :--- | :--- | :--- | :--- |
| `OD_CRD_001` | Should Credential be a new Prisma model, or reuse/extend existing `Document` and `DocumentStage` models? | Add Credential-specific models for credential/submission records, but keep issue pipeline relation to Document explicit. | Credential submission/history/expiry has a lifecycle distinct from Issue pipeline stages. |
| `OD_CRD_002` | How should the old 4-handover/signature concept relate to the latest 4-stage pipeline? | Treat 4-stage pipeline as the canonical MVP operations model. Defer fixed 4-signature invariant unless a separate ADR/spec maps signatures to stages. | Latest main reference supersedes the old wireframe interpretation. |
| `OD_CRD_003` | What is the credential validity period per document type? | Keep per-document-type validity with MVP default only after product approval. | Required for expiration and reissue rules. |
| `OD_CRD_004` | Which actor creates institution submission requests? | Institution/Admin creates requests; user responds through auth-gated submission. | Latest reference treats submission as heavy action and console row. |
| `OD_CRD_005` | What exact VC/XLS-70 payload fields are required in MVP? | Include XRP Testnet adapter evidence fields needed for `CredentialCreate`, `CredentialAccept`, and `CredentialDelete`: issuer, subject, credentialType, expiration, URI, tx hash, ledger index, validation result, flags/object snapshot when available. Production/mainnet payload requires separate approval. | Supports hackathon transaction-log review while preventing false mainnet finality claims. |
| `OD_CRD_006` | Should expiration mark `EXPIRED`, `FAILED`, or both? | Use `EXPIRED` for time-based status; use revocation/deletion audit record for cleanup/forced invalidation. | Keeps natural expiry distinct from operator/dispute revocation. |
| `OD_CRD_007` | Which operator APIs belong to Credential versus Dispute or Document domains? | Keep operator actions draft-only until Admin/Auth/Dispute permissions are approved. | Prevents authorization and bounded-context leakage. |
| `OD_CRD_008` | Does Credential need auth event linkage at all? | Credential should not own auth event ids; keep auth verification/log retention in Auth and document domains. | Latest reference keeps credential focused on blockchain evidence. |
