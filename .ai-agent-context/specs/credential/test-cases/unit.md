# Credential Unit Test Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Testing Rule**: Tests verify behavior through public entity/service methods. Mock only repository ports or external boundaries.

## 1. Credential Entity Tests

### Scenario: Accepted credential is usable before expiration
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = ACCEPTED`, `expiresAt > now`
- **Expected Outcome**: Returns true
- **Logic**: Valid credentials can be submitted during validity period.

### Scenario: Expired credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = ACCEPTED`, `expiresAt <= now`
- **Expected Outcome**: Returns false or submission enforcement throws `CREDENTIAL_EXPIRED`
- **Logic**: Expiration blocks submission synchronously.

### Scenario: Revoked credential is not usable
- **Target**: `Credential.canBeSubmitted(now)`
- **Input**: `status = REVOKED`, `expiresAt > now`
- **Expected Outcome**: Returns false or throws `CREDENTIAL_FAILED`
- **Logic**: Revocation blocks future submission.

### Scenario: Testnet credential evidence never claims production XRPL finality
- **Target**: Credential XRPL evidence mapping / adapter result mapping
- **Input**: Validated XRP Testnet transaction result
- **Expected Outcome**: transaction hash, ledger index, validation result, and Testnet marker are retained; production/mainnet finality is not claimed
- **Logic**: Hackathon review requires Testnet transaction logs while production/mainnet integration remains out of scope.

### Scenario: Credential without Testnet evidence is not treated as Testnet
- **Target**: `Credential.createIssued(...)`
- **Input**: Credential data without XRPL issuer/subject/credentialType evidence
- **Expected Outcome**: Testnet transaction fields are absent or clearly marked as unavailable
- **Logic**: A credential with no XRPL evidence must not be confused with validated Testnet evidence.

## 2. CredentialIssueRequest Tests

### Scenario: Issue request initializes 4-stage pipeline
- **Target**: `CredentialIssueRequest.create(...)`
- **Input**: Valid user/document type/issuer
- **Expected Outcome**: Pipeline includes RECEIVED, PRE_REVIEW, TRANSLATION_REVIEW, NOTARY_SIGNATURE, ISSUED
- **Logic**: Latest console uses 4-stage pipeline as canonical display model.

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

### Scenario: Submission stores only submission metadata
- **Target**: `CredentialService.submitCredential(...)`
- **Input**: Valid submission with consent confirmed
- **Expected Outcome**: Submission stores submission metadata and institution reference only
- **Logic**: Credential does not own Auth verification data.

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

### Scenario: Issue pipeline stage credential list derives created vs accepted state
- **Target**: `CredentialService.listCredentialsByDocumentStageId(...)`
- **Input**: Two credentials that share the same `currentStage`; one has `CredentialCreate` only, one has both `CredentialCreate` and `CredentialAccept`
- **Expected Outcome**: Returns `CREATED` for the create-only credential and `ACCEPTED` for the accepted credential
- **Logic**: Base credential status remains `CREATED`; acceptance is a derived view state.


## 5. XRPL Testnet Evidence API Tests

### Scenario: Accept Testnet credential stores ACCEPT evidence
- **Target**: `CredentialService.acceptTestnetCredential(...)` / public accept endpoint
- **Input**: User-owned credential with Testnet issuer, subject, and credentialType evidence
- **Expected Outcome**: Prepare returns unsigned XRPL payload with `Account = Subject`; submit requires matching `signedTransactionBlob`; one `CredentialXrplTransaction` is stored with `transactionKind = ACCEPT`; response returns tx hash, ledger index, validation result, and snapshot when available
- **Logic**: XLS-70 `CredentialAccept` is subject-owned acceptance, frontend signs with the user wallet, and hackathon review requires auditable Testnet evidence.

### Scenario: Delete Testnet credential stores DELETE evidence and revokes locally
- **Target**: `CredentialService.deleteTestnetCredential(...)` / public delete endpoint
- **Input**: User-owned credential with Testnet issuer, subject, credentialType evidence, and `submitterRole = SUBJECT`
- **Expected Outcome**: Prepare returns unsigned XRPL payload with `Account = Subject`; submit requires matching `signedTransactionBlob`; one `CredentialXrplTransaction` is stored with `transactionKind = DELETE`; local credential status becomes `FAILED`
- **Logic**: XLS-70 lets the subject delete its credential and future submissions must be blocked.

### Scenario: Delete Testnet credential can be submitted by issuer
- **Target**: `CredentialService.deleteTestnetCredential(...)` / public delete endpoint
- **Input**: User-owned credential with Testnet issuer, subject, credentialType evidence, and `submitterRole = ISSUER`
- **Expected Outcome**: Prepare returns unsigned XRPL payload with `Account = Issuer`; submit requires matching `signedTransactionBlob`; one `CredentialXrplTransaction` is stored with `transactionKind = DELETE`; local credential status becomes `FAILED`
- **Logic**: XLS-70 lets the issuer delete the credential it issued.

### Scenario: Credential without XRPL evidence cannot be accepted or deleted as Testnet evidence
- **Target**: `CredentialService.acceptTestnetCredential(...)`, `CredentialService.deleteTestnetCredential(...)`
- **Input**: Credential missing Testnet evidence fields
- **Expected Outcome**: Throws `CREDENTIAL_XRPL_EVIDENCE_REQUIRED`
- **Logic**: Missing XRPL evidence must not be confused with validated Testnet evidence.
