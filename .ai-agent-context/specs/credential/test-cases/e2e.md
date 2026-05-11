# Credential E2E Test Cases

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **API Boundary**: All responses must use `CommonRes<T>`.
- **Auth Boundary**: Protected Credential APIs use `Authorization: Bearer <Internal JWT>` from ADR-002.

## 1. User Journey: Issue Credential and View Pipeline

### Case: Successful issue request creation with Internal JWT
1. **Request**: `POST /api/v1/credentials/issue-requests` with `Authorization: Bearer <accessToken>` and valid `documentTypeId`.
2. **Response**: Expect `201 Created` with `CommonRes.success(data)`.
3. **Assert**: `data.issueRequestId` exists and `data.pipeline` contains five stages.

### Case: Reject issue request without Internal JWT
1. **Request**: `POST /api/v1/credentials/issue-requests` without Authorization header.
2. **Response**: Expect `401 Unauthorized`.
3. **Assert**: No issue request is created.

### Case: Issue request detail exposes 4-stage pipeline
1. **Request**: `GET /api/v1/credentials/issue-requests/{issueRequestId}` with Internal JWT.
2. **Response**: Expect `200 OK`.
3. **Assert**: Pipeline stages match latest reference order.

## 2. User Journey: Credential Wallet

### Case: List my credentials
1. **Precondition**: User owns at least one credential.
2. **Request**: `GET /api/v1/credentials` with Internal JWT.
3. **Response**: Expect `200 OK` with `CommonRes.success(data)`.
4. **Assert**: Response contains only current user's credentials and does not contain raw document, CI, JWT, or private key data.

### Case: Get credential detail with submissions
1. **Precondition**: User owns credential with submission history.
2. **Request**: `GET /api/v1/credentials/{credentialId}`.
3. **Response**: Expect credential detail including submission rows.
4. **Assert**: Each submission row includes status and institution reference data only.

## 3. User Journey: Institution Submission

### Case: Submit valid credential to institution request
1. **Precondition**: User owns an `ACCEPTED` credential and matching institution request exists.
2. **Request**: `POST /api/v1/credentials/{credentialId}/submissions` with `submissionRequestId` and `consentConfirmed = true`.
3. **Response**: Expect `201 Created` with `submissionId` and status `RECEIVED` or approved initial status.
4. **Assert**: `GET /api/v1/credentials/{credentialId}/submissions` returns the new row.

### Case: One credential can have multiple institution submission rows
1. **Precondition**: User owns one valid credential and two matching institution requests.
2. **Request**: Submit to both requests.
3. **Response**: Both submissions succeed or duplicate policy is applied only per request.
4. **Assert**: Submission list has two rows for the same credential.

### Case: Reject expired credential submission
1. **Precondition**: Credential has `expiresAt <= now`.
2. **Request**: `POST /api/v1/credentials/{credentialId}/submissions`.
3. **Response**: Expect `409 Conflict` mapped to `CREDENTIAL_EXPIRED` or approved equivalent.

## 4. Rejection and Dispute Context

### Case: Rejected submission exposes dispute conversion context
1. **Precondition**: Submission status is `REJECTED` with rejection reason.
2. **Request**: Load credential detail or submission list.
3. **Response**: Rejection reason and recipient institution are available.
4. **Assert**: Credential response does not create/own a Dispute case automatically.

## 5. Privacy and Safety Cases

### Case: Credential without XRPL evidence does not claim Testnet finality
1. **Request**: `GET /api/v1/credentials/{credentialId}` for MVP credential.
2. **Response**: Expect missing XRPL evidence to be clearly represented or an approved equivalent.
3. **Assert**: Response distinguishes XRP Testnet evidence from missing XRPL evidence and does not claim production/mainnet XRPL finality.

### Case: Credential APIs do not expose auth secrets
1. **Request**: Any Credential API.
2. **Response**: Inspect response body.
3. **Assert**: No JWT, raw CI, private key, or raw source document body is present.
