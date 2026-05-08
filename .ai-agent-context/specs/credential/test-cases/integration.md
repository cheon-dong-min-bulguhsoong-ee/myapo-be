# Credential Integration Test Cases

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Testing Boundary**: Prefer repository ports and public facades/services. Use real persistence only if the project has a test database strategy; otherwise mock external boundaries only.

## 1. Persistence Flows

### Scenario: Save and retrieve credential issue request with handovers
- **Step 1**: Create an issue request with four handover steps.
- **Step 2**: Retrieve the request by id.
- **Expectation**: Request fields and handover order match the saved data.

### Scenario: Sign handover persists immutable signature reference
- **Step 1**: Create an issue request waiting for step 1 signature.
- **Step 2**: Sign step 1.
- **Step 3**: Retrieve the request.
- **Expectation**: Step 1 contains signature hash/reference and signed timestamp; completed signature count is updated.

### Scenario: Final signature persists issued credential
- **Step 1**: Create request with all previous handovers signed.
- **Step 2**: Sign final handover.
- **Step 3**: Retrieve credential by returned id.
- **Expectation**: Credential is `ISSUED`, owner user id is correct, wallet address is populated, and mock XRPL metadata is marked as mock.

### Scenario: Credential list scopes by owner
- **Step 1**: Save credentials for two different users.
- **Step 2**: List credentials for user A.
- **Expectation**: Only user A credentials are returned.

### Scenario: Submission history accumulates for one credential
- **Step 1**: Save one issued credential.
- **Step 2**: Save two different institution submission requests.
- **Step 3**: Submit the credential to both requests.
- **Expectation**: Credential detail returns two submission history rows.

### Scenario: Revocation persists audit record
- **Step 1**: Save issued credential.
- **Step 2**: Revoke credential with reason and actor.
- **Step 3**: Retrieve credential and revocation record.
- **Expectation**: Credential is not submittable and revocation metadata is retained.

## 2. Cross-Module/Service Communication

### Scenario: Issue request validates related user and wallet
- **Action**: Create issue request for a current user.
- **Verification**: User/wallet lookup is performed through approved port/facade boundary.
- **Expectation**: Missing user or wallet blocks issuance.

### Scenario: Issue request validates document type or document eligibility
- **Action**: Create issue request for a document type or document id.
- **Verification**: Document/domain lookup is performed through approved boundary.
- **Expectation**: Ineligible document type or document state blocks issuance.

### Scenario: Submission validates institution request
- **Action**: Submit credential to an institution request id.
- **Verification**: Institution request is validated through approved boundary or repository port.
- **Expectation**: Missing or mismatched request blocks submission.

### Scenario: Dispute-linked revocation updates credential state
- **Action**: Execute operator/dispute revocation through approved service boundary.
- **Verification**: Credential state changes to revoked and dispute link is auditable.
- **Expectation**: Future submission attempts are blocked.
