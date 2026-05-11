# Credential Non-Functional Requirements

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.

## 1. Performance & Reliability

| Category | Requirement | Target Threshold | Source Level | Impact |
| :--- | :--- | :--- | :--- | :--- |
| List Latency | Credential/document tabs and submission rows should load quickly enough for operations use. | p95 < 300ms after DB warmup | Spec Inference | High |
| Submission Integrity | One institution submission action creates one durable submission row. | No duplicate row for same idempotency key/request | Reference Evidence | High |
| Auth Traceability | Auth-gated issue and submission actions should retain enough context for audit without storing auth event ids in Credential records. | 100% for production heavy actions | Reference Evidence | Critical |
| Expiration Reliability | Expired credentials must be blocked synchronously on submission. | No expired submission accepted | Reference Evidence | Critical |
| Audit Completeness | Issue pipeline changes, submissions, rejections, revocations, and dispute conversions must be traceable. | 100% of mutations auditable | Reference Evidence | Critical |

## 2. Security & Compliance

| Rule | Description | Requirement | Source Level |
| :--- | :--- | :--- | :--- |
| Internal JWT | Protected Credential APIs use `Authorization: Bearer <Internal JWT>`. | Do not design new APIs around raw Web3Auth token or persisted JWT sessions. | ADR Evidence |
| Stateless Session | Server does not store JWTs for Credential sessions. | Follow ADR-002 stateless strategy. | ADR Evidence |
| Owner Isolation | Users must not access another user's credentials/submissions. | Scope user-facing reads/mutations by verified user id from JWT. | Spec Inference |
| Auth Event Boundary | Credential must not own CI verification or raw CI values. | Keep authentication evidence out of Credential records. | Reference Evidence |
| Testnet Honesty | MVP credential metadata must distinguish validated XRP Testnet evidence from missing XRPL evidence. | Do not claim production/mainnet XRPL finality. | Hackathon Decision |
| Raw Data Protection | Raw source documents, CI originals, private keys, and JWTs must not appear in Credential responses. | Return metadata/references only. | Reference + ADR Evidence |

## 3. Observability

| Category | Requirement | Source Level |
| :--- | :--- | :--- |
| Console Tabs | Progress, valid, submitted, expired, revoked, and failed views must be derivable from backend state. | Reference Evidence |
| Submission Traceability | Submission rows must expose credential id, recipient institution, result, and rejection reason. | Reference Evidence |
| Dispute Traceability | Rejected submissions must provide enough context for Dispute conversion without Credential owning Dispute internals. | Reference Evidence |
