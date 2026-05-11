# Credential API Specification

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, user-facing APIs, nullable authEventId references, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Base Path**: `/api/v1/credentials`
- **Response Envelope**: Every response must use `CommonRes<T>`.
- **Error Model**: All business errors must use `DomainError` and `ErrorCode`.
- **Auth Strategy**: Protected user APIs use Internal JWT from ADR-002: `Authorization: Bearer <accessToken>`. `X-User-Id` is legacy/test fallback only if living code requires it.

## 1. Overview
Credential APIs support the latest frontend-design model:
- Credential issue requests appear in the 5-stage issue pipeline.
- Credential submission is a heavy auth-gated action and creates one row per institution submission.
- Submission rows can link to an Auth-owned auth event id.
- Document-driven credential issuance may carry an optional `documentStageId`; when present, the created credential stores that stage reference in `sourceDocumentRef` so the UI can list credentials by `document_stages.id`.
- Rejected submissions can be converted to Dispute context, but Dispute owns case lifecycle.
- Operator actions remain draft-only until Admin/Auth/Dispute permissions are approved.

## 2. Authentication & Authorization
- **User APIs**: `InternalJwtBearer` required.
- **Current User Source**: `JwtAuthGuard` verifies Internal JWT and extracts `userId`.
- **Logout/Revocation Note**: ADR-002 says server-side JWT revocation is not implemented in MVP; Credential must not store JWT sessions.
- **Operator APIs**: Draft-only. Must not be implemented until Admin/Auth permission specs are approved.

## 3. Endpoints

### 3.1. Create Credential Issue Request
- **Method**: `POST`
- **Path**: `/api/v1/credentials/issue-requests`
- **Source Level**: Reference + ADR Evidence
- **Description**: Starts a credential issue request as heavy action trigger `issue_request` and returns 5-stage pipeline state.

```yaml
paths:
  /api/v1/credentials/issue-requests:
    post:
      summary: Create credential issue request
      operationId: createCredentialIssueRequest
      security:
        - InternalJwtBearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCredentialIssueRequestReq'
      responses:
        '201':
          description: Issue request created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResCreateCredentialIssueRequestRes'
        '400':
          description: Validation failure or unavailable document type
        '401':
          description: Unauthorized Internal JWT
        '409':
          description: Duplicate active issue request
```

### 3.2. Get Credential Issue Request
- **Method**: `GET`
- **Path**: `/api/v1/credentials/issue-requests/{issueRequestId}`
- **Source Level**: Reference Evidence
- **Description**: Returns issue request status, 5-stage pipeline, credential result if created, and submission count if any.

```yaml
paths:
  /api/v1/credentials/issue-requests/{issueRequestId}:
    get:
      summary: Get credential issue request
      operationId: getCredentialIssueRequest
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: issueRequestId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Issue request returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResCredentialIssueRequestRes'
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Issue request not found
```

### 3.3. List My Credentials
- **Method**: `GET`
- **Path**: `/api/v1/credentials`
- **Source Level**: Reference Evidence
- **Description**: Returns current user's credentials with optional lifecycle tab/status filter. If `status` is omitted, return all credentials for the current user.

```yaml
paths:
  /api/v1/credentials:
    get:
      summary: List my credentials
      operationId: listMyCredentials
      security:
        - InternalJwtBearer: []
      parameters:
        - in: query
          name: status
          required: false
          schema:
            type: string
            enum: [ISSUED, EXPIRED, REVOKED, FAILED]
      responses:
        '200':
          description: Credential list returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResListCredentialsRes'
        '401':
          description: Unauthorized Internal JWT
```

### 3.4. List Credentials by Document Stage
- **Method**: `GET`
- **Path**: `/api/v1/credentials/document-stages/{documentStageId}`
- **Source Level**: Spec Inference
- **Description**: Returns the current user's credentials linked to a specific `document_stages.id`. Response includes basic credential metadata plus a derived `credentialState` that distinguishes `CredentialCreate` completed / `CredentialAccept` pending from accepted credentials.

```yaml
paths:
  /api/v1/credentials/document-stages/{documentStageId}:
    get:
      summary: List credentials by document stage id
      operationId: listCredentialsByDocumentStageId
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: documentStageId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Credential list returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResListCredentialsByDocumentStageRes'
        '401':
          description: Unauthorized Internal JWT
        '400':
          description: Invalid document stage id
```

### 3.5. Get My Credential Detail
- **Method**: `GET`
- **Path**: `/api/v1/credentials/{credentialId}`
- **Source Level**: Reference Evidence
- **Description**: Returns credential metadata, issue pipeline summary, and submission history. Raw documents, JWTs, CI originals, and private keys are never returned.

```yaml
paths:
  /api/v1/credentials/{credentialId}:
    get:
      summary: Get my credential detail
      operationId: getMyCredentialDetail
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Credential detail returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResCredentialDetailRes'
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
```

### 3.6. Submit Credential to Institution Request
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/submissions`
- **Source Level**: Reference + ADR Evidence
- **Description**: Submits one valid credential to one institution request. This is heavy action trigger `institution_submit` and should link the resulting Auth-owned auth event id.

```yaml
paths:
  /api/v1/credentials/{credentialId}/submissions:
    post:
      summary: Submit credential to institution request
      operationId: submitCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubmitCredentialReq'
      responses:
        '201':
          description: Credential submitted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResSubmitCredentialRes'
        '400':
          description: Invalid institution request or missing consent/auth event
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential or institution request not found
        '409':
          description: Credential expired, revoked, failed, or duplicate submission
```

### 3.7. List Credential Submissions
- **Method**: `GET`
- **Path**: `/api/v1/credentials/{credentialId}/submissions`
- **Source Level**: Reference Evidence
- **Description**: Returns one row per institution submission for a credential.

```yaml
paths:
  /api/v1/credentials/{credentialId}/submissions:
    get:
      summary: List credential submissions
      operationId: listCredentialSubmissions
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Submission rows returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResListCredentialSubmissionsRes'
```

### 3.7. Prepare Testnet CredentialAccept Transaction
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/xrpl/accept/prepare`
- **Source Level**: Hackathon Decision + XLS-70 Reference
- **Description**: Returns an unsigned XRP Testnet `CredentialAccept` transaction payload for frontend wallet signing. XLS-70 requires `Account = Subject`; backend must derive Subject/Issuer/CredentialType from stored credential evidence, not from client input.

```yaml
paths:
  /api/v1/credentials/{credentialId}/xrpl/accept/prepare:
    post:
      summary: Prepare XRP Testnet CredentialAccept transaction
      operationId: prepareAcceptTestnetCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      responses:
        '201':
          description: Unsigned CredentialAccept transaction returned for frontend wallet signing
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResXrplCredentialTransactionRes'
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential has no Testnet evidence or cannot be accepted
```

### 3.8. Submit Signed Testnet CredentialAccept Transaction
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/xrpl/accept`
- **Source Level**: Hackathon Decision + XLS-70 Reference
- **Description**: Submits a frontend wallet-signed XRP Testnet `CredentialAccept` transaction blob and stores evidence. The signed transaction must match the server-prepared payload for the same credential: `Account = Subject`, `Issuer = credential.xrplIssuerAddress`, and `CredentialType = credential.xrplCredentialType`.

```yaml
paths:
  /api/v1/credentials/{credentialId}/xrpl/accept:
    post:
      summary: Submit signed XRP Testnet CredentialAccept transaction
      operationId: acceptTestnetCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AcceptTestnetCredentialReq'
      responses:
        '201':
          description: Testnet CredentialAccept evidence stored
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResXrplCredentialEvidenceRes'
        '400':
          description: Signed transaction blob cannot be decoded or does not match expected credential transaction
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential has no Testnet evidence or cannot be accepted
```

### 3.9. Prepare Testnet CredentialDelete Transaction
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/xrpl/delete/prepare`
- **Source Level**: Hackathon Decision + XLS-70 Reference
- **Description**: Returns an unsigned XRP Testnet `CredentialDelete` transaction payload for frontend wallet signing. XLS-70 allows `Subject` or `Issuer` to delete at any time; MVP exposes `submitterRole = SUBJECT | ISSUER`. Third-party expired cleanup is excluded until policy is approved.

```yaml
paths:
  /api/v1/credentials/{credentialId}/xrpl/delete/prepare:
    post:
      summary: Prepare XRP Testnet CredentialDelete transaction
      operationId: prepareDeleteTestnetCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PrepareDeleteTestnetCredentialReq'
      responses:
        '201':
          description: Unsigned CredentialDelete transaction returned for frontend wallet signing
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResXrplCredentialTransactionRes'
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential has no Testnet evidence or cannot be deleted
```

### 3.10. Submit Signed Testnet CredentialDelete Transaction
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/xrpl/delete`
- **Source Level**: Hackathon Decision + XLS-70 Reference
- **Description**: Submits a frontend wallet-signed XRP Testnet `CredentialDelete` transaction blob, stores evidence, and marks the local credential `REVOKED`. The signed transaction must match the server-prepared payload for the same credential and submitter role.

```yaml
paths:
  /api/v1/credentials/{credentialId}/xrpl/delete:
    post:
      summary: Submit signed XRP Testnet CredentialDelete transaction
      operationId: deleteTestnetCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeleteTestnetCredentialReq'
      responses:
        '201':
          description: Testnet CredentialDelete evidence stored and local credential revoked
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResXrplCredentialEvidenceRes'
        '400':
          description: Signed transaction blob cannot be decoded or does not match expected credential transaction
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential has no Testnet evidence or cannot be deleted
```

### 3.11. Reissue Credential
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/reissue`
- **Source Level**: Reference Evidence
- **Description**: Starts a new issue request from an expired/revoked/reissuable credential. Exact reissue policy remains an open decision.

```yaml
paths:
  /api/v1/credentials/{credentialId}/reissue:
    post:
      summary: Reissue credential
      operationId: reissueCredential
      security:
        - InternalJwtBearer: []
      parameters:
        - in: path
          name: credentialId
          required: true
          schema:
            type: string
      responses:
        '201':
          description: Reissue request created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResCreateCredentialIssueRequestRes'
        '401':
          description: Unauthorized Internal JWT
        '403':
          description: Owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential is not reissuable
```

## 4. Draft Operator Endpoints Requiring Additional Specs

| Operation | Draft Path | Source | Gate |
| :--- | :--- | :--- | :--- |
| Revoke credential | `POST /api/v1/ops/credentials/{credentialId}/revoke` | Dispute detail action `크리덴셜 폐기` | Admin/Auth/Dispute permission spec |
| Force issue request progress | `POST /api/v1/ops/credential-issue-requests/{issueRequestId}/force-advance` | Request detail risk action | Admin/Auth permission spec |
| Convert rejected submission to dispute | Dispute-owned endpoint TBD | Submitted row `분쟁 신고로 전환` | Dispute spec |

## 5. Components (Schemas)

```yaml
components:
  securitySchemes:
    InternalJwtBearer:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Server-issued Internal JWT from /api/v1/auth/login.
  schemas:
    CreateCredentialIssueRequestReq:
      type: object
      required: [documentTypeId]
      properties:
        documentTypeId:
          type: string
        documentId:
          type: string
          nullable: true
        documentStageId:
          type: string
          nullable: true
        authEventId:
          type: string
          nullable: true
          description: Auth-owned event id for issue_request trigger, when available.
    CreateCredentialIssueRequestRes:
      type: object
      properties:
        issueRequestId:
          type: string
        status:
          type: string
          enum: [ISSUING, USER_APPROVAL_REQUIRED, ISSUED, FAILED]
        pipeline:
          type: array
          items:
            $ref: '#/components/schemas/IssuePipelineStageItem'
        currentStage:
          type: string
          enum: [RECEIVED, PRE_REVIEW, TRANSLATION_REVIEW, NOTARY_SIGNATURE, ISSUED]
        currentSubstep:
          type: string
          nullable: true
        authEventId:
          type: string
          nullable: true
    CredentialIssueRequestRes:
      allOf:
        - $ref: '#/components/schemas/CreateCredentialIssueRequestRes'
        - type: object
          properties:
            credentialId:
              type: string
              nullable: true
            submissionCount:
              type: integer
    IssuePipelineStageItem:
      type: object
      properties:
        stage:
          type: string
          enum: [RECEIVED, PRE_REVIEW, TRANSLATION_REVIEW, NOTARY_SIGNATURE, ISSUED]
        label:
          type: string
        status:
          type: string
          enum: [PENDING, ACTIVE, DONE, FAILED]
        substep:
          type: string
          nullable: true
    CredentialSummary:
      type: object
      properties:
        credentialId:
          type: string
        issueRequestId:
          type: string
        documentTypeId:
          type: string
        documentTypeName:
          type: string
        issuerId:
          type: string
        status:
          type: string
          enum: [ISSUED, EXPIRED, REVOKED, FAILED]
        issuedAt:
          type: string
          format: date-time
        expiresAt:
          type: string
          format: date-time
        walletAddress:
          type: string
        isMock:
          type: boolean
    ListCredentialsRes:
      type: object
      properties:
        credentials:
          type: array
          items:
            $ref: '#/components/schemas/CredentialSummary'
    CredentialDocumentStageRes:
      allOf:
        - $ref: '#/components/schemas/CredentialSummary'
        - type: object
          properties:
            credentialState:
              type: string
              enum: [ISSUED_PENDING_ACCEPT, ISSUED_ACCEPTED, EXPIRED, REVOKED, FAILED]
    ListCredentialsByDocumentStageRes:
      type: object
      properties:
        credentials:
          type: array
          items:
            $ref: '#/components/schemas/CredentialDocumentStageRes'
    CredentialDetailRes:
      allOf:
        - $ref: '#/components/schemas/CredentialSummary'
        - type: object
          properties:
            pipeline:
              type: array
              items:
                $ref: '#/components/schemas/IssuePipelineStageItem'
            submissions:
              type: array
              items:
                $ref: '#/components/schemas/CredentialSubmissionItem'
            sourceDocumentRef:
              type: string
              nullable: true
    SubmitCredentialReq:
      type: object
      required: [submissionRequestId, consentConfirmed]
      properties:
        submissionRequestId:
          type: string
        consentConfirmed:
          type: boolean
        authEventId:
          type: string
          nullable: true
          description: Auth-owned event id for institution_submit trigger, when available.
    AcceptTestnetCredentialReq:
      type: object
      required: [signedTransactionBlob]
      properties:
        signedTransactionBlob:
          type: string
          description: XRPL signed transaction blob generated by the subject wallet from the prepared CredentialAccept transaction.
    PrepareDeleteTestnetCredentialReq:
      type: object
      required: [submitterRole]
      properties:
        submitterRole:
          type: string
          enum: [SUBJECT, ISSUER]
          description: XLS-70 CredentialDelete signer role. SUBJECT signs with the credential holder wallet; ISSUER signs with the issuer wallet.
    DeleteTestnetCredentialReq:
      type: object
      required: [submitterRole, signedTransactionBlob]
      properties:
        submitterRole:
          type: string
          enum: [SUBJECT, ISSUER]
          description: XLS-70 CredentialDelete submitter. SUBJECT signs as the credential holder; ISSUER signs as the credential issuer. Third-party expired deletion is an XLS-70 capability but is outside MVP API scope.
        signedTransactionBlob:
          type: string
          description: XRPL signed transaction blob generated by the selected submitter wallet from the prepared CredentialDelete transaction.
    SubmitCredentialRes:
      type: object
      properties:
        submissionId:
          type: string
        credentialId:
          type: string
        recipientInstitutionId:
          type: string
        status:
          type: string
          enum: [RECEIVED, VERIFYING, REJECTED]
        submittedAt:
          type: string
          format: date-time
        authEventId:
          type: string
          nullable: true
    ListCredentialSubmissionsRes:
      type: object
      properties:
        submissions:
          type: array
          items:
            $ref: '#/components/schemas/CredentialSubmissionItem'

    XrplCredentialTransactionRes:
      type: object
      properties:
        transactionKind:
          type: string
          enum: [ACCEPT, DELETE]
        network:
          type: string
        transaction:
          type: object
          description: Unsigned XRPL transaction JSON to sign in the frontend wallet.

    XrplCredentialEvidenceRes:
      type: object
      properties:
        transactionKind:
          type: string
          enum: [CREATE, ACCEPT, DELETE]
        network:
          type: string
        transactionHash:
          type: string
        engineResult:
          type: string
        ledgerIndex:
          type: string
          nullable: true
        validated:
          type: boolean
        feeDrops:
          type: string
          nullable: true
        account:
          type: string
        issuer:
          type: string
          nullable: true
        subject:
          type: string
          nullable: true
        credentialType:
          type: string
        flags:
          type: integer
          nullable: true
        objectSnapshot:
          type: object
          nullable: true
    CredentialSubmissionItem:
      type: object
      properties:
        submissionId:
          type: string
        credentialId:
          type: string
        recipientInstitutionId:
          type: string
        recipientInstitutionName:
          type: string
        status:
          type: string
          enum: [RECEIVED, VERIFYING, REJECTED]
        rejectionReason:
          type: string
          nullable: true
        submittedAt:
          type: string
          format: date-time
        authEventId:
          type: string
          nullable: true
```

## 6. Draft Error Codes Needed

| Draft Error | HTTP | Trigger |
| :--- | :--- | :--- |
| `CREDENTIAL_NOT_FOUND` | 404 | Credential id does not exist. |
| `CREDENTIAL_OWNER_MISMATCH` | 403 | Current JWT user does not own the credential. |
| `CREDENTIAL_EXPIRED` | 409 | Credential expired before submission/use. |
| `CREDENTIAL_REVOKED` | 409 | Credential was revoked. |
| `CREDENTIAL_NOT_SUBMITTABLE` | 409 | Credential status is failed or otherwise not valid. |
| `CREDENTIAL_ALREADY_SUBMITTED` | 409 | Duplicate submission for same institution request. |
| `CREDENTIAL_XRPL_EVIDENCE_REQUIRED` | 409 | Testnet Accept/Delete requested for mock or non-XRPL credential. |
| `ISSUE_REQUEST_NOT_FOUND` | 404 | Issue request id does not exist. |
| `ISSUE_REQUEST_NOT_ADVANCEABLE` | 409 | Issue request cannot advance in current state. |
| `INSTITUTION_SUBMISSION_REQUEST_NOT_FOUND` | 404 | No matching institution request exists. |
| `AUTH_EVENT_REQUIRED` | 400 | Required heavy-action auth evidence is missing. |
| `AUTH_EVENT_MISMATCH` | 409 | Auth event does not match user/action/object. |
