# Credential E2E Test Cases

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **API Boundary**: All responses must use `CommonRes<T>`.
- **Auth Boundary**: Use current temporary `X-User-Id` until Web3Auth/JWT is finalized.

## 1. User Journey: Issue Credential and View Wallet

### Case: Successful issue request creation
1. **Request**: `POST /api/v1/credentials/issue-requests` with valid `documentTypeId` and `X-User-Id`.
2. **Response**: Expect `201 Created` with `CommonRes.success(data)`.
3. **Assert**: `data.issueRequestId` exists, `data.requiredSignatureCount` is `4`, and status is `ISSUING` or `SIGNATURE_REQUIRED`.

### Case: Sign all handovers and receive credential
1. **Request**: Repeatedly call `POST /api/v1/credentials/issue-requests/{issueRequestId}/signatures` for required handover steps.
2. **Response**: Each response is `CommonRes.success(data)`.
3. **Assert**: Final response includes `credentialId` and status `ISSUED`.
4. **Request**: `GET /api/v1/credentials`.
5. **Response**: Credential appears in the user's wallet list with `isMock = true`.

### Case: Issuer response error is returned safely
1. **Request**: `POST /api/v1/credentials/issue-requests` for a document type configured to simulate issuer failure.
2. **Response**: Expect failure response mapped by `ApiExceptionHandler`.
3. **Assert**: Error uses `DomainError`/`ErrorCode`, not raw exception text.

## 2. User Journey: Submit Credential to Institution

### Case: Submit valid credential to existing institution request
1. **Precondition**: User owns an `ISSUED` credential and a matching institution request exists.
2. **Request**: `POST /api/v1/credentials/{credentialId}/submissions` with `submissionRequestId` and `consentConfirmed = true`.
3. **Response**: Expect `201 Created` with `submissionId`.
4. **Request**: `GET /api/v1/credentials/{credentialId}`.
5. **Assert**: Submission history contains the recipient institution.

### Case: Reject submission without institution request
1. **Precondition**: User owns an `ISSUED` credential but no matching institution request exists.
2. **Request**: `POST /api/v1/credentials/{credentialId}/submissions`.
3. **Response**: Expect `409 Conflict` mapped to `INSTITUTION_REQUEST_REQUIRED` or approved equivalent.

### Case: Reject expired credential submission
1. **Precondition**: User owns credential with `expiresAt <= now`.
2. **Request**: `POST /api/v1/credentials/{credentialId}/submissions`.
3. **Response**: Expect `409 Conflict` mapped to `CREDENTIAL_EXPIRED` or approved equivalent.

## 3. User Journey: Reissue Expired Credential

### Case: Reissue expired credential
1. **Precondition**: User owns an expired credential.
2. **Request**: `POST /api/v1/credentials/{credentialId}/reissue`.
3. **Response**: Expect `201 Created` with new `issueRequestId`.
4. **Assert**: New request requires the signature flow again.

### Case: Reject reissue for another user's credential
1. **Precondition**: Credential belongs to user A.
2. **Request**: User B calls `POST /api/v1/credentials/{credentialId}/reissue`.
3. **Response**: Expect `403 Forbidden` mapped to owner mismatch.

## 4. Operator Journey: Revoke Credential

### Case: Operator revokes credential after dispute
- **Status**: Draft-only, blocked until Admin/Auth spec exists.
1. **Precondition**: Operator has approved permission and credential is linked to a dispute.
2. **Request**: `POST /api/v1/ops/credentials/{credentialId}/revoke` with reason.
3. **Response**: Expect credential status `REVOKED`.
4. **Assert**: Future user submission attempts fail.

## 5. Privacy and Safety Cases

### Case: Credential detail does not expose raw source document or private key
1. **Request**: `GET /api/v1/credentials/{credentialId}`.
2. **Response**: Expect metadata and references only.
3. **Assert**: Response does not contain raw document file content, private key, or secret material.

### Case: Mock XRPL metadata is clearly marked
1. **Request**: `GET /api/v1/credentials/{credentialId}` for MVP credential.
2. **Response**: Expect `isMock = true` or approved equivalent field.
3. **Assert**: Response does not claim production XRPL finality.
