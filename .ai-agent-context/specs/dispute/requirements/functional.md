# Dispute Functional Requirements

## 1. Core Scenarios (Gherkin format)

### Scenario: User files a new dispute
- **Given** a user has a completed credential issuance request
- **When** the user submits a dispute with type, source, headline, and evidence
- **Then** a new `Dispute` is created with status `RECEIVED`
- **And** the initial SLA is set based on the dispute type

### Scenario: Admin assigns an operator using Least Load policy
- **Given** a dispute is in `RECEIVED` state
- **When** the admin selects an operator based on the minimum active case count
- **Then** the dispute status changes to `ASSIGNED`
- **And** the assignment is recorded in the timeline

### Scenario: Operator resolves a dispute with reissuance (Option B)
- **Given** a dispute is in `IN_REVIEW` state
- **And** an on-chain credential exists for the original request (`REQ-001`)
- **When** the operator resolves the dispute with "Reissue" action
- **Then** the system MUST first execute XRPL `CredentialDelete` for `REQ-001`
- **And** upon successful revocation, the system creates a **new request** (`REQ-002`)
- **And** `REQ-002` reuses the original document files from `REQ-001`
- **And** `REQ-002` is placed in the Translation queue with **HIGH** priority
- **And** the dispute status changes to `RESOLVED`

### Scenario: Operator rejects a dispute
- **Given** a dispute is in `IN_REVIEW` state
- **When** the operator rejects the dispute with a valid reason
- **Then** the dispute status changes to `REJECTED`
- **And** the reason is visible to the user in the read-only view
