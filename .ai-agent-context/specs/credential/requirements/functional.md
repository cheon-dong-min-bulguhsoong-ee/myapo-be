# Credential Functional Requirements

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Primary Sources**: Wireframe v4 files under `frontend/wireframe/v4` in `IDEATION-scaffold`.
- **Evidence Boundary**: Scenarios marked `Wireframe Evidence` are directly visible in the wireframe. Scenarios marked `Spec Inference` are proposed backend behavior to support the visible UX.

## 1. Core Scenarios

### Scenario: Start credential issuance from a selected document type
- **Source Level**: Wireframe Evidence
- **Given** a registered user is viewing available document types for their persona
- **And** the selected document type is available for issuance
- **When** the user starts issuance
- **Then** an issuance request is created
- **And** the credential lifecycle enters `ISSUING`
- **And** the user can see the current progress and required signatures

### Scenario: Block issuance when the issuer is unavailable
- **Source Level**: Wireframe Evidence
- **Given** a user tries to start issuance
- **And** the issuer or upstream institution does not respond
- **When** the system attempts to create or advance the issuance request
- **Then** the request is rejected or marked failed
- **And** the user receives a retryable issuer-response error

### Scenario: Require user signature for each handover step
- **Source Level**: Wireframe Evidence
- **Given** an issuance request is in progress
- **And** a handover step requires user confirmation
- **When** the user signs the handover
- **Then** the signature count increases
- **And** the request advances only after the required signature for the current handover is recorded

### Scenario: Complete issuance after all required signatures
- **Source Level**: Wireframe Evidence
- **Given** an issuance request has all required handover signatures
- **When** the final credential is created
- **Then** the credential is delivered to the user's wallet
- **And** its status becomes `ISSUED`
- **And** it has an expiration timestamp
- **And** it can be reused during the valid period

### Scenario: Show credential wallet list
- **Source Level**: Wireframe Evidence
- **Given** a user has credentials in their wallet
- **When** the user opens `내 문서`
- **Then** the system returns credentials grouped or filterable by usable and expired status
- **And** each credential includes document type, issuer, status, expiration, and available actions

### Scenario: Prevent submission without an institution request
- **Source Level**: Wireframe Evidence
- **Given** a user has an issued credential
- **And** no institution has requested that credential or document type
- **When** the user attempts to submit the credential
- **Then** submission is not available
- **And** the response explains that the institution must request it first

### Scenario: Submit credential to a requesting institution
- **Source Level**: Wireframe Evidence
- **Given** a user has an `ISSUED` credential that has not expired or been revoked
- **And** an institution submission request exists for that credential or document type
- **When** the user submits the credential to the institution
- **Then** the submission is recorded
- **And** the submission history includes the recipient institution and submitted time
- **And** the credential remains reusable until expiration unless policy says otherwise

### Scenario: Reject submission of expired credential
- **Source Level**: Wireframe Evidence
- **Given** a credential is past its expiration timestamp
- **When** the user attempts to submit it
- **Then** the system rejects the submission
- **And** the credential is treated as `EXPIRED` or queued for auto-deletion/revocation

### Scenario: Auto-delete or revoke credential after expiration
- **Source Level**: Wireframe Evidence
- **Given** a credential has expired
- **When** the expiration lifecycle is processed
- **Then** the credential becomes unusable
- **And** a deletion/revocation record is created
- **And** source document deletion and key destruction are requested if those integrations exist

### Scenario: Reissue an expired credential
- **Source Level**: Wireframe Evidence
- **Given** a user has an expired credential
- **When** the user starts reissuance
- **Then** a new issuance request is created
- **And** the user must complete the required signature flow again
- **And** the new credential receives a new validity period

### Scenario: View credential issuance history
- **Source Level**: Wireframe Evidence
- **Given** a user has an issued credential
- **When** the user opens the credential history
- **Then** the system returns the handover timeline
- **And** each step can reference the actor, signature state, and source document snapshot reference

### Scenario: Support dispute linkage for a credential
- **Source Level**: Wireframe Evidence
- **Given** a user or institution identifies an issue with an issued credential
- **When** a dispute is filed
- **Then** the credential can be linked to the dispute
- **And** operators can inspect credential id, request id, handover chain, and related history
- **And** dispute resolution may lead to reissue or revocation

### Scenario: Operator revokes credential from dispute resolution
- **Source Level**: Wireframe Evidence
- **Given** an operator reviews a dispute
- **And** the credential should no longer be valid
- **When** the operator executes credential revocation
- **Then** the credential becomes `REVOKED`
- **And** future submissions are blocked
- **And** the revocation reason is auditable

### Scenario: External XRPL publishing is mock-only in MVP
- **Source Level**: Wireframe Evidence
- **Given** the MVP runs with XRPL Credential Mock
- **When** a credential is issued, submitted, expired, or revoked
- **Then** the backend stores mock/testnet metadata only
- **And** it must not claim production XRPL finality unless a later ADR/spec approves real integration
