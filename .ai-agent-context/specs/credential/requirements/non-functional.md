# Credential Non-Functional Requirements

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, mock XRPL metadata, user-facing APIs, nullable authEventId references. Excluded: operator APIs, production XRPL, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.

## 1. Performance & Reliability

| Category | Requirement | Target Threshold | Source Level | Impact |
| :--- | :--- | :--- | :--- | :--- |
| List Latency | Credential/document tabs and submission rows should load quickly enough for operations use. | p95 < 300ms after DB warmup | Spec Inference | High |
| Submission Integrity | One institution submission action creates one durable submission row. | No duplicate row for same idempotency key/request | Reference Evidence | High |
| Auth Link Reliability | Auth-gated issue and submission actions should link to an auth event id when Auth log is available. | 100% for production heavy actions | Reference Evidence | Critical |
| Expiration Reliability | Expired credentials must be blocked synchronously on submission. | No expired submission accepted | Reference Evidence | Critical |
| Audit Completeness | Issue pipeline changes, submissions, rejections, revocations, and dispute conversions must be traceable. | 100% of mutations auditable | Reference Evidence | Critical |

## 2. Security & Compliance

| Rule | Description | Requirement | Source Level |
| :--- | :--- | :--- | :--- |
| Internal JWT | Protected Credential APIs use `Authorization: Bearer <Internal JWT>`. | Do not design new APIs around raw Web3Auth token or persisted JWT sessions. | ADR Evidence |
| Stateless Session | Server does not store JWTs for Credential sessions. | Follow ADR-002 stateless strategy. | ADR Evidence |
| Owner Isolation | Users must not access another user's credentials/submissions. | Scope user-facing reads/mutations by verified user id from JWT. | Spec Inference |
| Auth Event Boundary | Credential must not own CI verification or raw CI values. | Store/link `authEventId` only. | Reference Evidence |
| Mock Honesty | MVP credential metadata must identify mock/testnet behavior. | Do not claim production XRPL finality. | Reference Evidence |
| Raw Data Protection | Raw source documents, CI originals, private keys, and JWTs must not appear in Credential responses. | Return metadata/references only. | Reference + ADR Evidence |

## 3. Observability

| Category | Requirement | Source Level |
| :--- | :--- | :--- |
| Console Tabs | Progress, valid, submitted, expired, revoked, and failed views must be derivable from backend state. | Reference Evidence |
| Submission Traceability | Submission rows must expose credential id, recipient institution, result, rejection reason, and auth event link when available. | Reference Evidence |
| Dispute Traceability | Rejected submissions must provide enough context for Dispute conversion without Credential owning Dispute internals. | Reference Evidence |
