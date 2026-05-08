# Credential Use Cases

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.

## 1. CreateCredentialIssueRequest
- **Actor**: User
- **Trigger**: User taps issuance start in the mobile app.
- **Source Level**: Wireframe Evidence and Spec Inference.

### Service Flow
1. **Validation**: Confirm current user exists and requested document type is eligible.
2. **Issuer Resolution**: Resolve issuer from document type/persona. Exact rule is open.
3. **Duplicate Guard**: Check for existing active issue request for the same user/document type if product policy requires uniqueness.
4. **Create Request**: Create `CredentialIssueRequest` with `ISSUING` or `SIGNATURE_REQUIRED`.
5. **Create Handovers**: Initialize draft default four handover steps.
6. **Persistence**: Save request and handovers transactionally.
7. **Side Effects**: Return next action for the user; do not call production XRPL.

### Input / Output
- **Inputs**: `userId`, `documentTypeId`, optional `documentId`, optional `personaType`.
- **Outputs**: `issueRequestId`, `status`, `requiredSignatureCount`, `completedSignatureCount`, `currentHandoverStep`, `nextAction`.

### Side Effects
- **Events Fired**: Draft `CredentialIssueRequestCreated` if event infrastructure is adopted.
- **Notifications**: Optional signature-needed notification.

## 2. SignCredentialHandover
- **Actor**: User
- **Trigger**: User taps sign action for the current handover.
- **Source Level**: Wireframe Evidence.

### Service Flow
1. **Validation**: Load issue request by id and current user id.
2. **State Guard**: Ensure request is signable and step is current.
3. **Signature Guard**: Reject duplicate signature for the same step unless idempotency token matches previous result.
4. **Record Signature**: Store signature hash/reference and `signedAt`.
5. **Advance Handover**: Mark current handover signed/completed.
6. **Complete or Continue**: If all signatures are complete, create final credential; otherwise move to next handover/signature step.
7. **Persistence**: Save changes transactionally.

### Input / Output
- **Inputs**: `userId`, `issueRequestId`, `handoverStep`, `signature`, optional `signedAt`.
- **Outputs**: Updated issue request status and optional `credentialId`.

### Side Effects
- **Events Fired**: Draft `CredentialHandoverSigned`, `CredentialIssued`.
- **Notifications**: Optional next signature prompt or credential-arrived notification.

## 3. ListMyCredentials
- **Actor**: User
- **Trigger**: User opens wallet/document list.
- **Source Level**: Wireframe Evidence.

### Service Flow
1. **Validation**: Read current user id.
2. **Query**: Load credentials owned by the user, optionally filtered by status.
3. **Status Projection**: Treat `expiresAt <= now` as expired for response even if background revocation has not run.
4. **Mapping**: Return summary rows safe for mobile display.

### Input / Output
- **Inputs**: `userId`, optional `status`.
- **Outputs**: Credential summaries.

## 4. GetMyCredentialDetail
- **Actor**: User
- **Trigger**: User opens credential detail/history.
- **Source Level**: Wireframe Evidence.

### Service Flow
1. **Validation**: Load credential by id and verify owner.
2. **Load History**: Load handovers, submission history, and source document snapshot references.
3. **Privacy Guard**: Do not return raw source document or private key material.
4. **Mapping**: Return detail response.

### Input / Output
- **Inputs**: `userId`, `credentialId`.
- **Outputs**: Credential detail, handover history, submission history.

## 5. SubmitCredential
- **Actor**: User
- **Trigger**: User selects an institution request and sends credential.
- **Source Level**: Wireframe Evidence.

### Service Flow
1. **Validation**: Load credential by id and verify owner.
2. **Credential Guard**: Ensure credential is issued, not expired, and not revoked.
3. **Request Guard**: Ensure institution submission request exists and matches the credential/document type/user.
4. **Consent Guard**: Ensure explicit user submission confirmation is present.
5. **Create Submission**: Record submission history row.
6. **Persistence**: Save submission transactionally.
7. **Side Effects**: Notify or expose submission to institution UI if integration exists.

### Input / Output
- **Inputs**: `userId`, `credentialId`, `submissionRequestId`, `consentConfirmed`.
- **Outputs**: `submissionId`, `credentialId`, `recipientInstitutionId`, `submittedAt`.

## 6. ReissueCredential
- **Actor**: User
- **Trigger**: User taps reissue for an expired/revoked credential.
- **Source Level**: Wireframe Evidence.

### Service Flow
1. **Validation**: Load credential by id and verify owner.
2. **Reissue Guard**: Ensure credential is expired or otherwise reissuable.
3. **Create New Request**: Start a new `CredentialIssueRequest` using the original document type and issuer policy.
4. **Persistence**: Save new request and handovers.
5. **Output**: Return new issue request status.

### Input / Output
- **Inputs**: `userId`, `credentialId`.
- **Outputs**: New issue request response.

## 7. ExpireCredentialLifecycle
- **Actor**: System job or explicit domain service
- **Trigger**: Current time reaches or passes `expiresAt`.
- **Source Level**: Wireframe Evidence and Spec Inference.

### Service Flow
1. **Scan or Load**: Find credentials whose `expiresAt <= now` and are not already revoked/deleted.
2. **Mark Unusable**: Mark as `EXPIRED` or `REVOKED` according to approved lifecycle decision.
3. **Record Deletion**: Create `CredentialRevocationRecord` with expiration reason.
4. **Request Cleanup**: Request source document deletion and key destruction if integrations exist.
5. **Persistence**: Save state and audit records.

### Input / Output
- **Inputs**: `now`, optional `credentialId`.
- **Outputs**: Count or record of processed credentials.

## 8. RevokeCredentialByOperator
- **Actor**: Operator/Admin
- **Trigger**: Dispute resolution, member action, or request-detail action.
- **Source Level**: Wireframe Evidence.
- **Implementation Gate**: Requires Admin/Auth spec before implementation.

### Service Flow
1. **Authorization**: Verify operator permission.
2. **Validation**: Load credential.
3. **Idempotency Guard**: If already revoked, return existing revocation result.
4. **Revoke**: Mark credential revoked and create revocation record.
5. **Side Effects**: Notify user and related institution/dispute flows if specified.

### Input / Output
- **Inputs**: `operatorId`, `credentialId`, `reason`.
- **Outputs**: Revocation result.
