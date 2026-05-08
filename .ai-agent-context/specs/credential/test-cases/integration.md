# Credential Integration Test Cases

## 0. Draft Status
- **Status**: Draft updated from latest main references. User approval is required before implementation.
- **Testing Boundary**: Prefer repository ports and public facades/services. Use real persistence only if a test DB strategy exists.

## 1. Persistence Flows

### Scenario: Save and retrieve issue request with 5-stage pipeline
- **Step 1**: Create issue request.
- **Step 2**: Retrieve by id.
- **Expectation**: Five pipeline stages are present in canonical order and current stage is preserved.

### Scenario: Advance issue pipeline and create credential at completion
- **Step 1**: Create issue request.
- **Step 2**: Advance through allowed stages to `ISSUED`.
- **Expectation**: Credential is created or returned according to approved policy.

### Scenario: Credential list scopes by JWT user
- **Step 1**: Save credentials for two users.
- **Step 2**: Query using user A context.
- **Expectation**: Only user A credentials are returned.

### Scenario: Submission rows accumulate for one credential
- **Step 1**: Save one issued credential.
- **Step 2**: Save two distinct institution requests.
- **Step 3**: Submit credential to both.
- **Expectation**: Credential detail returns two submission rows.

### Scenario: Submission stores auth event reference only
- **Step 1**: Submit credential with `authEventId`.
- **Step 2**: Retrieve submission.
- **Expectation**: `authEventId` is present; raw CI/JWT/auth payload is absent.

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

### Scenario: Credential submission links Auth-owned event
- **Action**: Submit credential with auth event id.
- **Verification**: Auth event is referenced/validated through approved boundary.
- **Expectation**: Credential stores id reference only.

### Scenario: Revocation blocks future submission
- **Action**: Revoke credential, then try to submit.
- **Expectation**: Submission is rejected.
