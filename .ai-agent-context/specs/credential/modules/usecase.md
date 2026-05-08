# Credential Use Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, mock XRPL metadata, user-facing APIs, nullable authEventId references. Excluded: operator APIs, production XRPL, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.

## 1. CreateCredentialIssueRequest
- **Actor**: Authenticated User
- **Trigger**: User starts document/credential issuance.
- **Auth**: Internal JWT required; action is Auth trigger `issue_request`.

### Service Flow
1. **Auth Context**: Receive `userId` from `JwtAuthGuard`-verified Internal JWT.
2. **Auth Event Link**: Accept or request an Auth-owned `authEventId` for `issue_request` when Auth integration is available.
3. **Validation**: Confirm user, wallet, document type, and issuer eligibility through approved boundaries.
4. **Create Request**: Create `CredentialIssueRequest` with 5-stage pipeline starting at `RECEIVED` or appropriate current stage.
5. **Persistence**: Save request and initial stage snapshots transactionally.
6. **Output**: Return request id, status, current stage, pipeline, and auth event link.

### Input / Output
- **Inputs**: `userId`, `documentTypeId`, optional `documentId`, optional `authEventId`.
- **Outputs**: `issueRequestId`, `status`, `currentStage`, `currentSubstep`, `pipeline`, `authEventId`.

## 2. AdvanceIssuePipeline
- **Actor**: System or approved operator flow
- **Trigger**: Backend processing advances a request through the 5-stage pipeline.
- **Implementation Gate**: Operator force-advance requires Admin/Auth spec.

### Service Flow
1. **Load Request**: Find request and current pipeline stage.
2. **Validate Transition**: Ensure next stage follows allowed order.
3. **Apply Substep**: Set optional `CREDENTIAL_CREATION` or `USER_APPROVAL` substep when needed.
4. **Complete Credential**: When stage reaches `ISSUED` and credential creation succeeds, create `Credential`.
5. **Persist**: Save request, stage snapshots, credential result, and failure reason if failed.

### Input / Output
- **Inputs**: `issueRequestId`, `nextStage`, optional `substep`, optional `actorContext`.
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

## 5. SubmitCredential
- **Actor**: Authenticated User
- **Trigger**: User submits credential to an institution request.
- **Auth**: Internal JWT required; action is Auth trigger `institution_submit`.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Auth Event Link**: Accept/verify Auth-owned `authEventId` for `institution_submit` when available.
3. **Credential Guard**: Ensure credential is owned by user, `ISSUED`, not expired, not revoked.
4. **Institution Request Guard**: Ensure target institution request exists and matches credential/document type/user.
5. **Consent Guard**: Ensure explicit user submission confirmation.
6. **Create Submission Row**: Save one `CredentialSubmission` with initial status `RECEIVED` or configured initial status.
7. **Output**: Return submission id, recipient institution, status, submitted time, and auth event id.

## 6. UpdateSubmissionResult
- **Actor**: Institution/System/Operator integration
- **Trigger**: Institution marks submission as received, verifying, or rejected.

### Service Flow
1. **Load Submission**: Find by submission id.
2. **Validate Transition**: Ensure status can move to `RECEIVED`, `VERIFYING`, or `REJECTED`.
3. **Record Reason**: Require/retain rejection reason when rejected.
4. **Persist**: Save updated status and audit metadata.
5. **Dispute Context**: If rejected, expose context for Dispute conversion without creating Dispute directly.

## 7. ReissueCredential
- **Actor**: Authenticated User
- **Trigger**: User starts reissue for expired/revoked/reissuable credential.

### Service Flow
1. **Auth Context**: Use JWT `userId`.
2. **Load Credential**: Verify owner.
3. **Reissue Guard**: Ensure credential is reissuable by approved policy.
4. **Create New Request**: Start a new issue request with the original document type/issuer policy.

## 8. RevokeCredential
- **Actor**: System or approved operator/dispute flow
- **Trigger**: Expiration cleanup, dispute resolution, or operator action.
- **Implementation Gate**: Operator/dispute action requires approved Admin/Auth/Dispute specs.

### Service Flow
1. **Authorization**: Verify actor authority for non-system revocation.
2. **Load Credential**: Find target credential.
3. **Idempotency Guard**: If already revoked, return existing result.
4. **Revoke**: Mark status `REVOKED` and create `CredentialRevocationRecord`.
5. **Block Submission**: Ensure future submissions are rejected.
