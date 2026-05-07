# Credential Unit Test Cases

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Testing Rule**: Tests must verify behavior through public entity/service methods. Mock only repository ports or external boundaries.

## 1. Credential Entity Tests

### Scenario: Issued credential is usable before expiration
- **Target**: `Credential.canBeSubmitted(now)` or equivalent public method
- **Input**: `status = ISSUED`, `expiresAt > now`
- **Expected Outcome**: Returns true
- **Logic**: Valid credentials can be submitted during their validity period.

### Scenario: Expired credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = ISSUED`, `expiresAt <= now`
- **Expected Outcome**: Returns false or throws `DomainError(ErrorCode.Credential.CREDENTIAL_EXPIRED)` when enforcing submission
- **Logic**: Expiration blocks submission even before a background job updates stored status.

### Scenario: Revoked credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = REVOKED`, `expiresAt > now`
- **Expected Outcome**: Returns false or throws `CREDENTIAL_REVOKED`
- **Logic**: Revocation has priority over remaining validity period.

### Scenario: Revocation records audit reason
- **Target**: `Credential.revoke(reason, actor)`
- **Input**: Valid issued credential, revocation reason
- **Expected Outcome**: Status becomes `REVOKED`, `revokedAt` is set, reason is retained
- **Logic**: Dispute/operator/system revocation must be auditable.

## 2. CredentialIssueRequest Tests

### Scenario: Issue request cannot complete without all signatures
- **Target**: `CredentialIssueRequest.completeIfReady()` or equivalent
- **Input**: `requiredSignatureCount = 4`, `completedSignatureCount = 3`
- **Expected Outcome**: Completion is rejected or status remains `SIGNATURE_REQUIRED`
- **Logic**: Four-handover signature chain must be complete before final credential creation.

### Scenario: Signing current handover advances signature count
- **Target**: `CredentialIssueRequest.signHandover(step, signature)`
- **Input**: Current step `2`, valid signature
- **Expected Outcome**: Handover step is signed and completed signature count increments by one
- **Logic**: User signature advances the trust chain.

### Scenario: Duplicate handover signature is rejected
- **Target**: `CredentialIssueRequest.signHandover(step, signature)`
- **Input**: A step already signed
- **Expected Outcome**: Throws `HANDOVER_ALREADY_SIGNED` or returns idempotent prior result if idempotency is designed
- **Logic**: Signature chain must not double-count.

### Scenario: Out-of-order handover signature is rejected
- **Target**: `CredentialIssueRequest.signHandover(step, signature)`
- **Input**: Request current step `2`, attempted signature for step `3`
- **Expected Outcome**: Throws `HANDOVER_STEP_INVALID`
- **Logic**: Trust chain order must be deterministic.

## 3. CredentialSubmission Tests

### Scenario: Submission requires institution request
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Issued credential, no matching institution submission request
- **Expected Outcome**: Throws `INSTITUTION_REQUEST_REQUIRED`
- **Logic**: Wireframe says the institution must request first.

### Scenario: Submission creates history row for valid request
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Issued credential, matching institution submission request, consent confirmed
- **Expected Outcome**: Returns submission result and repository saves a submission record
- **Logic**: Submission history must accumulate per credential.

### Scenario: Submission rejects missing consent confirmation
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Valid credential and request, `consentConfirmed = false`
- **Expected Outcome**: Throws validation/domain error
- **Logic**: User action is required for provision to institution.

## 4. CredentialService Tests

### Scenario: Create issue request initializes handovers
- **Target**: `CredentialService.createIssueRequest(...)`
- **Input**: Eligible user/document type/issuer
- **Expected Outcome**: Issue request is saved with draft default four handover steps
- **Logic**: Mobile progress UI requires handover/signature state.

### Scenario: Issuer unavailable returns retryable failure
- **Target**: `CredentialService.createIssueRequest(...)`
- **Input**: Issuer resolution or issuer precheck fails
- **Expected Outcome**: Throws `ISSUER_UNAVAILABLE` or saves failed request according to implementation decision
- **Logic**: Wireframe has issuer response error and retry path.

### Scenario: Final signature creates mock credential
- **Target**: `CredentialService.signHandover(...)`
- **Input**: Issue request with final handover waiting for signature
- **Expected Outcome**: Credential is created with `isMock = true`, `issuedAt`, `expiresAt`, wallet address, and `ISSUED` status
- **Logic**: MVP must not claim production XRPL finality.

### Scenario: Expiration lifecycle blocks future submission
- **Target**: `CredentialService.processExpiration(...)` and `submitCredential(...)`
- **Input**: Credential past `expiresAt`
- **Expected Outcome**: Credential becomes expired/revoked or submission path rejects it
- **Logic**: Expired credentials are unusable even if cleanup is async.
