# Credential Unit Test Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, mock XRPL metadata, user-facing APIs, nullable authEventId references. Excluded: operator APIs, production XRPL, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Testing Rule**: Tests verify behavior through public entity/service methods. Mock only repository ports or external boundaries.

## 1. Credential Entity Tests

### Scenario: Issued credential is usable before expiration
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = ISSUED`, `expiresAt > now`
- **Expected Outcome**: Returns true
- **Logic**: Valid credentials can be submitted during validity period.

### Scenario: Expired credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = ISSUED`, `expiresAt <= now`
- **Expected Outcome**: Returns false or submission enforcement throws `CREDENTIAL_EXPIRED`
- **Logic**: Expiration blocks submission synchronously.

### Scenario: Revoked credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = REVOKED`, `expiresAt > now`
- **Expected Outcome**: Returns false or throws `CREDENTIAL_REVOKED`
- **Logic**: Revocation blocks future submission.

### Scenario: Mock credential never claims production XRPL finality
- **Target**: `Credential.createIssued(...)`
- **Input**: MVP mock credential data
- **Expected Outcome**: `isMock = true`; production finality fields are absent or clearly mock/testnet
- **Logic**: Latest references preserve mock/testnet boundary.

## 2. CredentialIssueRequest Tests

### Scenario: Issue request initializes 5-stage pipeline
- **Target**: `CredentialIssueRequest.create(...)`
- **Input**: Valid user/document type/issuer
- **Expected Outcome**: Pipeline includes RECEIVED, PRE_REVIEW, TRANSLATION_REVIEW, NOTARY_SIGNATURE, ISSUED
- **Logic**: Latest console uses 5-stage pipeline as canonical display model.

### Scenario: Issue pipeline advances in order
- **Target**: `CredentialIssueRequest.advanceTo(nextStage)`
- **Input**: Current stage `RECEIVED`, next stage `PRE_REVIEW`
- **Expected Outcome**: Stage advances and previous stage becomes done
- **Logic**: Pipeline order must be deterministic.

### Scenario: Out-of-order pipeline advance is rejected
- **Target**: `CredentialIssueRequest.advanceTo(nextStage)`
- **Input**: Current stage `RECEIVED`, attempted `NOTARY_SIGNATURE`
- **Expected Outcome**: Throws pipeline transition error
- **Logic**: Prevent invalid progress projections.

### Scenario: User approval substep is represented without changing stage count
- **Target**: `CredentialIssueRequest.requireUserApproval(substep)`
- **Input**: Current pipeline stage and `USER_APPROVAL`
- **Expected Outcome**: Request status becomes `USER_APPROVAL_REQUIRED` and stage count remains five
- **Logic**: Latest reference treats credential creation/user approval as substeps.

## 3. CredentialSubmission Tests

### Scenario: Submission requires valid credential and institution request
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Issued credential, valid institution request, consent confirmed
- **Expected Outcome**: One `CredentialSubmission` is created
- **Logic**: Row unit is one institution submission.

### Scenario: Multiple submissions for one credential create multiple rows
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: One credential, two distinct institution submission requests
- **Expected Outcome**: Two submission records exist for the same credential
- **Logic**: Latest reference says one credential submitted to N institutions creates N rows.

### Scenario: Submission links auth event id
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Valid submission with `authEventId`
- **Expected Outcome**: Submission stores the auth event id by reference
- **Logic**: Credential links to Auth-owned log without owning CI data.

### Scenario: Submission rejects expired credential
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Credential with `expiresAt <= now`
- **Expected Outcome**: Throws `CREDENTIAL_EXPIRED`
- **Logic**: Expired credential cannot be submitted.

### Scenario: Submission result can become rejected with reason
- **Target**: `CredentialSubmission.markRejected(reason)`
- **Input**: Existing submission, rejection reason
- **Expected Outcome**: Status becomes `REJECTED`, reason is retained
- **Logic**: Rejection context feeds dispute conversion.

## 4. Auth Boundary Tests

### Scenario: Credential service receives user id from verified JWT context
- **Target**: Credential facade/service entry method
- **Input**: `userId` supplied by `JwtAuthGuard` context
- **Expected Outcome**: User id scopes read/mutation
- **Logic**: ADR-002 makes Internal JWT the protected API strategy.

### Scenario: Credential never stores JWT session data
- **Target**: Credential domain/service models
- **Input**: Credential issue/submission action
- **Expected Outcome**: No access token or session token is persisted in Credential objects
- **Logic**: ADR-002 prohibits server-side JWT session storage.
