# Credential Integration Test Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Testing Boundary**: Prefer repository ports and public facades/services. Use real persistence only if a test DB strategy exists.

## 1. Persistence Flows

### Scenario: Save and retrieve issue request with 4-stage pipeline
- **Step 1**: Create issue request.
- **Step 2**: Retrieve by id.
- **Expectation**: Five pipeline stages are present in canonical order and current stage is preserved.

### Scenario: Advance issue pipeline and create credential at completion
- **Step 1**: Create issue request.
- **Step 2**: Advance through allowed stages to `ISSUED`.
- **Expectation**: Credential row is created with status `CREATED`; a later acceptance flow updates it to `ACCEPTED`.

### Scenario: Credential list scopes by JWT user
- **Step 1**: Save credentials for two users.
- **Step 2**: Query using user A context.
- **Expectation**: Only user A credentials are returned.

### Scenario: Submission rows accumulate for one credential
- **Step 1**: Save one issued credential.
- **Step 2**: Save two distinct institution requests.
- **Step 3**: Submit credential to both.
- **Expectation**: Credential detail returns two submission rows.

### Scenario: Rejected submission can provide dispute context
- **Step 1**: Mark submission rejected with reason.
- **Step 2**: Load dispute conversion context through approved boundary.
- **Expectation**: Context includes submission id, credential id, institution id, and reason; Dispute entity is not created by Credential automatically.

## 2. Cross-Module/Service Communication

### Scenario: Credential issue uses User/Wallet through approved boundary
- **Action**: Create issue request for authenticated user.
- **Verification**: User/wallet lookup uses approved port/facade/service boundary.
- **Expectation**: Missing user/wallet blocks issuance.

### Scenario: Credential issue aligns with Document pipeline without importing internals
- **Action**: Create or advance issue request associated with a document.
- **Verification**: Document relationship is by id/approved boundary.
- **Expectation**: Credential does not import Document internals directly.

### Scenario: Credential submission keeps Auth data out of Credential records
- **Action**: Submit credential through the approved boundary.
- **Verification**: Auth verification remains outside Credential records.
- **Expectation**: Credential stores only submission metadata needed for audit and listing.

### Scenario: Revocation blocks future submission
- **Action**: Revoke credential, then try to submit.
- **Expectation**: Submission is rejected.
