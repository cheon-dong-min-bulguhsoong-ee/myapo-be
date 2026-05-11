# Credential Functional Requirements

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Primary Sources**: `.ai-agent-context/references/frontend-design/Readme.md`, ADR-002.

## 1. Core Scenarios

### Scenario: Start credential issuance as an authenticated heavy action
- **Source Level**: Reference + ADR Evidence
- **Given** a registered user has an Internal JWT
- **And** the user starts a credential/document issuance request
- **When** the system accepts the request
- **Then** the action is treated as auth trigger `issue_request`
- **And** the issue request enters the 4-stage pipeline
- **And** the response includes the pipeline state or next action

### Scenario: Track issuance through the 4-stage pipeline
- **Source Level**: Reference Evidence
- **Given** an issuance request exists
- **When** operators or system processes advance the request
- **Then** the request can be displayed in one of the four stages: MyData 수신, 문서 이동, 번역 수신, 아포스티유 수신

### Scenario: Complete issuance and create usable credential
- **Source Level**: Reference Evidence
- **Given** the issue pipeline reaches 발급 완료
- **When** credential creation succeeds
- **Then** the credential becomes `ISSUED`
- **And** it appears in the valid documents/credentials view
- **And** it has issued and expiration metadata

### Scenario: List credential documents by lifecycle tab
- **Source Level**: Reference Evidence
- **Given** credentials and issue requests exist
- **When** an operator or user views credential/document lists
- **Then** records can be grouped by progress, valid, submitted, expired, revoked, and failed states
- **And** active and ended states remain visually distinct

### Scenario: Submit credential as an authenticated heavy action
- **Source Level**: Reference + ADR Evidence
- **Given** a user has an Internal JWT
- **And** the user owns an `ACCEPTED` credential that is not expired or revoked
- **And** a valid institution submission request exists
- **When** the user submits the credential
- **Then** the action is treated as auth trigger `institution_submit`
- **And** one submission record is created for that institution request

### Scenario: Multiple institution submissions are separate records
- **Source Level**: Reference Evidence
- **Given** one credential is submitted to multiple institutions
- **When** the submissions are listed
- **Then** each submission is displayed as a separate row
- **And** the credential detail/request detail can show N submission history rows

### Scenario: Track institution submission result
- **Source Level**: Reference Evidence
- **Given** a credential submission exists
- **When** the institution receives, verifies, or rejects it
- **Then** the submission status is represented as `RECEIVED`, `VERIFYING`, or `REJECTED`
- **And** rejection reason is retained for dispute conversion

### Scenario: Convert rejected submission to dispute
- **Source Level**: Reference Evidence
- **Given** an institution submission is `REJECTED`
- **When** the user/operator starts dispute conversion
- **Then** the dispute draft is prefilled with rejection reason and institution source
- **And** Credential only provides linked context; Dispute owns the final dispute state

### Scenario: Reject expired credential submission
- **Source Level**: Reference Evidence
- **Given** a credential is past its expiration timestamp
- **When** the user attempts institution submission
- **Then** the system rejects the submission
- **And** the credential is treated as `EXPIRED` for validity checks

### Scenario: Revoke credential from dispute/operator lifecycle
- **Source Level**: Reference Evidence
- **Given** a credential is invalidated by an approved dispute/operator action
- **When** revocation is executed
- **Then** the credential becomes `FAILED`
- **And** future submissions are blocked
- **And** action reason/audit metadata is retained

### Scenario: Publish XRP Testnet XLS-70 evidence for hackathon review
- **Source Level**: Hackathon Decision + XLS-70 Reference
- **Given** hackathon review checks transaction logs
- **When** a credential is issued through the MVP Testnet flow
- **Then** the system should submit or prepare auditable XRP Testnet `CredentialCreate`, `CredentialAccept`, and `CredentialDelete` evidence as applicable
- **And** the result should retain transaction hash, ledger index, validation result, and relevant Credential object snapshot when available
- **And** the system must not claim production/mainnet XRPL finality
- **And** production/mainnet XLS-70 integration requires a separate approved decision/spec
