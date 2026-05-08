# Credential Functional Requirements

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, mock XRPL metadata, user-facing APIs, nullable authEventId references. Excluded: operator APIs, production XRPL, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Primary Sources**: `.ai-agent-context/references/frontend-design/Readme.md`, ADR-002.

## 1. Core Scenarios

### Scenario: Start credential issuance as an authenticated heavy action
- **Source Level**: Reference + ADR Evidence
- **Given** a registered user has an Internal JWT
- **And** the user starts a credential/document issuance request
- **When** the system accepts the request
- **Then** the action is treated as auth trigger `issue_request`
- **And** the issue request enters the 5-stage pipeline
- **And** the response includes the pipeline state or next action

### Scenario: Track issuance through the 5-stage pipeline
- **Source Level**: Reference Evidence
- **Given** an issuance request exists
- **When** operators or system processes advance the request
- **Then** the request can be displayed in one of the five stages: 접수, 사전 검토, 번역/검수, 공증 서명, 발급 완료
- **And** credential creation or user approval can be represented as substeps

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
- **And** the user owns an `ISSUED` credential that is not expired or revoked
- **And** a valid institution submission request exists
- **When** the user submits the credential
- **Then** the action is treated as auth trigger `institution_submit`
- **And** an auth event id is linked to the submission when available
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
- **Then** the credential becomes `REVOKED`
- **And** future submissions are blocked
- **And** action reason/audit metadata is retained

### Scenario: External XRPL publishing remains mock-only unless approved
- **Source Level**: Reference Evidence
- **Given** MVP uses mock/testnet credential metadata
- **When** a credential is issued, submitted, expired, or revoked
- **Then** the system must not claim production XRPL finality
- **And** production XLS-70 integration requires an explicit approved decision/spec
