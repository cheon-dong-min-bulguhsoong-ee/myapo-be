# Credential Use Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.

## 1. CreateCredentialIssueRequest
- **Actor**: Authenticated User
- **Trigger**: User starts document/credential issuance.
- **Auth**: Internal JWT required; action is Auth trigger `issue_request`.

### Service Flow
1. **Auth Context**: Receive `userId` from `JwtAuthGuard`-verified Internal JWT.
3. **Validation**: Confirm user, wallet, document type, and issuer eligibility through approved boundaries.
4. **Create Request**: Create `CredentialIssueRequest` with 4-stage pipeline ending at `APOSTILLE_ISSUED` or appropriate current stage.
5. **Persistence**: Save request and initial stage snapshots transactionally.
6. **Output**: Return request id, status, current stage, and pipeline.

### Input / Output
- **Inputs**: `userId`, `documentTypeId`, optional `documents.document_code`, optional `currentStage`.
- **Outputs**: `issueRequestId`, `status`, `currentStage`, `pipeline`.

## 2. AdvanceIssuePipeline
- **Actor**: System or approved operator flow
- **Trigger**: Backend processing advances a request through the 4-stage pipeline.
- **Implementation Gate**: Operator force-advance requires Admin/Auth spec.

### Service Flow
1. **Load Request**: Find request and current pipeline stage.
2. **Validate Transition**: Ensure next stage follows allowed order.
3. **Complete Credential**: When stage reaches `APOSTILLE_ISSUED` and credential creation succeeds, create `Credential`.
4. **Persist**: Save request, stage snapshots, credential result, and failure reason if failed.

### Input / Output
- **Inputs**: `issueRequestId`, `nextStage`, optional `actorContext`.
- **Outputs**: Updated issue request result and optional credential id.

## 3. ListMyCredentials
- **Actor**: Authenticated User
- **Trigger**: User opens credential/document wallet.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Query**: Load credentials by owner with optional status filter.
3. **Status Projection**: Treat `expiresAt <= now` as expired for response/submission checks.
4. **Map**: Return summaries without raw documents, CI values, JWTs, or private keys.

## 4. GetMyCredentialDetail
- **Actor**: Authenticated User
- **Trigger**: User opens credential detail/history.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify owner.
3. **Load Context**: Load issue pipeline projection and submission history.
4. **Privacy Guard**: Return metadata and references only.

## 5. ListCredentialsByIssuePipelineStage
- **Actor**: Authenticated User
- **Trigger**: User opens the credential list for a specific `document_stages.id`.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Reference Lookup**: Load credentials by `currentStage` matching the given `currentStage` snapshot.
3. **Derived State**: Return `CREATED` when `CredentialCreate` exists but no `ACCEPT` evidence exists; return `ACCEPTED` when `ACCEPT` evidence exists.
4. **Lifecycle State**: Preserve base states `EXPIRED`, `REVOKED`, and `FAILED` as-is.
5. **Map**: Return summaries plus the derived `credentialState`.

## 6. SubmitCredential
- **Actor**: Authenticated User
- **Trigger**: User submits credential to an institution request.
- **Auth**: Internal JWT required; action is Auth trigger `institution_submit`.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
3. **Credential Guard**: Ensure credential is owned by user, `ACCEPTED`, not expired, not revoked.
4. **Institution Request Guard**: Ensure target institution request exists and matches credential/document type/user.
5. **Consent Guard**: Ensure explicit user submission confirmation.
6. **Create Submission Row**: Save one `CredentialSubmission` with initial status `RECEIVED` or configured initial status.
7. **Output**: Return submission id, recipient institution, status, and submitted time.

## 7. UpdateSubmissionResult
- **Actor**: Institution/System/Operator integration
- **Trigger**: Institution marks submission as received, verifying, or rejected.

### Service Flow
1. **Load Submission**: Find by submission id.
2. **Validate Transition**: Ensure status can move to `RECEIVED`, `VERIFYING`, or `REJECTED`.
3. **Record Reason**: Require/retain rejection reason when rejected.
4. **Persist**: Save updated status and audit metadata.
5. **Dispute Context**: If rejected, expose context for Dispute conversion without creating Dispute directly.

## 8. ReissueCredential
- **Actor**: Authenticated User
- **Trigger**: User starts reissue for expired/revoked/reissuable credential.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify owner.
3. **Reissue Guard**: Ensure credential is reissuable by approved policy.
4. **Create New Request**: Start a new issue request with the original document type/issuer policy.

## 9. RevokeCredential
- **Actor**: System or approved operator/dispute flow
- **Trigger**: Expiration cleanup, dispute resolution, or operator action.
- **Implementation Gate**: Operator/dispute action requires approved Admin/Auth/Dispute specs.

### Service Flow
1. **Authorization**: Verify actor authority for non-system revocation.
2. **Load Credential**: Find target credential.
3. **Idempotency Guard**: If already revoked, return existing result.
4. **Revoke**: Mark status `REVOKED` and create `CredentialRevocationRecord`.
5. **Block Submission**: Ensure future submissions are rejected.


## 10. PrepareAcceptTestnetCredential
- **Actor**: Authenticated User
- **Trigger**: Frontend needs an XRP Testnet `CredentialAccept` payload for wallet signing.
- **Scope Gate**: MVP/Testnet-only; production/mainnet finality remains out of scope.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify the credential exists and is owned by the user.
3. **Evidence Guard**: Reject credentials without Testnet issuer/subject/credentialType evidence.
4. **Build Payload**: Build XLS-70 `CredentialAccept` with `Account = Subject`, `Issuer = credential.xrplIssuerAddress`, and `CredentialType = credential.xrplCredentialType`.
5. **Output**: Return unsigned transaction JSON and network for frontend wallet signing. Backend must not receive or store private keys.

## 11. AcceptTestnetCredential
- **Actor**: Authenticated User
- **Trigger**: Frontend submits the user wallet-signed XRP Testnet `CredentialAccept` transaction blob.
- **Scope Gate**: MVP/Testnet-only; production/mainnet finality remains out of scope.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify the credential exists and is owned by the user.
3. **Evidence Guard**: Reject credentials without Testnet issuer/subject/credentialType evidence.
4. **Signed Payload Guard**: Decode `signedTransactionBlob` and require it to match the server-prepared `CredentialAccept` target.
5. **Submit Signed Transaction**: Submit the signed blob to XRP Testnet without server-side user signing.
6. **Persist Evidence**: Save one `CredentialXrplTransaction` row with `transactionKind = ACCEPT`.
7. **Output**: Return transaction hash, ledger index, validation result, and object snapshot when available.

## 12. PrepareDeleteTestnetCredential
- **Actor**: Authenticated User
- **Trigger**: Frontend needs an XRP Testnet `CredentialDelete` payload for wallet signing.
- **Scope Gate**: MVP/Testnet-only; production/mainnet finality remains out of scope.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify the credential exists and is owned by the user.
3. **Evidence Guard**: Reject credentials without Testnet issuer/subject/credentialType evidence.
4. **Authorize XRPL Submitter Role**: Require `submitterRole` to be `SUBJECT` or `ISSUER`. XLS-70 also allows anyone to delete after expiration, but third-party expired cleanup is outside MVP API scope.
5. **Build Payload**: Build XLS-70 `CredentialDelete` with `Account = Subject` for `SUBJECT` submitter or `Account = Issuer` for `ISSUER` submitter; include both `Subject` and `Issuer` to target the exact credential.
6. **Output**: Return unsigned transaction JSON and network for frontend wallet signing. Backend must not receive or store private keys.

## 13. DeleteTestnetCredential
- **Actor**: Authenticated User
- **Trigger**: Frontend submits the selected wallet-signed XRP Testnet `CredentialDelete` transaction blob.
- **Scope Gate**: MVP/Testnet-only; production/mainnet finality remains out of scope.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify the credential exists and is owned by the user.
3. **Evidence Guard**: Reject credentials without Testnet issuer/subject/credentialType evidence.
4. **Signed Payload Guard**: Decode `signedTransactionBlob` and require it to match the server-prepared `CredentialDelete` target for the requested `submitterRole`.
5. **Submit Signed Transaction**: Submit the signed blob to XRP Testnet without server-side user signing.
6. **Persist Evidence**: Save one `CredentialXrplTransaction` row with `transactionKind = DELETE`.
7. **Local Lifecycle**: Mark the local credential `FAILED` and retain the transaction evidence.
8. **Output**: Return transaction hash, ledger index, validation result, and object snapshot when available.
