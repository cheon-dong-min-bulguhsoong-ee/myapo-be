# Credential Non-Functional Requirements

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.

## 1. Performance & Reliability

| Category | Requirement | Target Threshold | Source Level | Impact |
| :--- | :--- | :--- | :--- | :--- |
| Read Latency | User wallet list and credential detail should be fast enough for mobile app usage. | p95 < 300ms after DB warmup | Spec Inference | High |
| Mutation Idempotency | Issuance, signature, submission, and revocation commands should be safe against duplicate client retries. | Duplicate request does not create duplicate active credential/submission/signature | Spec Inference | High |
| Expiration Reliability | Expired credentials must become non-submittable even if background deletion is delayed. | Submission path checks `expiresAt` synchronously | Wireframe Evidence | Critical |
| Audit Completeness | Handover, signature, submission, expiration, revocation, and dispute-linked actions must be traceable. | 100% of state-changing actions have auditable metadata | Wireframe Evidence | Critical |
| External Failure Handling | Issuer/XRPL/storage failures should produce retryable or inspectable failed states. | Failure reason preserved | Wireframe Evidence | High |

## 2. Security & Compliance

| Rule | Description | Requirement | Source Level |
| :--- | :--- | :--- | :--- |
| Owner Isolation | Users must not read or mutate another user's credentials. | Require current user id check for user-facing APIs. | Spec Inference |
| Private Data Protection | Raw source document and private keys must not be returned in API responses. | Return metadata, references, and download handles only through approved Document/Storage paths. | Spec Inference |
| Expiration Deletion | Expiration must trigger invalidation and deletion/key-destruction workflow when available. | Credential cannot be submitted after expiry; deletion operations are auditable. | Wireframe Evidence |
| Consent/Provision Boundary | Institution submission requires a prior request and user action. | Do not silently submit credentials without explicit user submission. | Wireframe Evidence |
| Mock Honesty | MVP must identify mock/testnet behavior clearly in metadata and docs. | Do not label mock records as production XRPL finality. | Wireframe Evidence |

## 3. Observability

| Category | Requirement | Source Level |
| :--- | :--- | :--- |
| Operator Console | Credential issue status, credential id, wallet address, submission history, failures, and disputes must be visible to operations. | Wireframe Evidence |
| Error Diagnostics | Failed issuance/submission/revocation should preserve machine-readable reason codes. | Spec Inference |
| Dispute Traceability | Handover chain and signatures must support dispute investigation. | Wireframe Evidence |
