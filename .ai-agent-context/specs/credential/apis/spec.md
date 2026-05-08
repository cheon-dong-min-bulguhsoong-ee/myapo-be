# Credential API Specification

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Base Path**: `/api/v1/credentials`
- **Response Envelope**: Every response must use `CommonRes<T>`.
- **Error Model**: All business errors must use `DomainError` and `ErrorCode`.
- **Auth Caveat**: Current project authentication is temporary. User-facing APIs are written for `CurrentUserId`/`X-User-Id` until Web3Auth/JWT is finalized.

## 1. Overview
Credential APIs support the user wallet and MVP XRPL Credential Mock lifecycle shown in the wireframe:
- Start credential issuance from an approved/eligible document flow.
- Record user signatures for handover steps.
- List and inspect wallet credentials.
- Submit valid credentials to institution requests.
- Reissue expired credentials.
- Revoke credentials when allowed by operator/dispute flows.

## 2. Authentication & Authorization
- **User APIs**: Require current user id from temporary auth (`X-User-Id`) or future Web3Auth guard.
- **Operator APIs**: Draft-only. Must not be implemented until Admin/Auth authorization spec exists.
- **Ownership Rule**: User-facing endpoints must scope all reads/mutations to the current user.

## 3. Endpoints

### 3.1. Create Credential Issue Request
- **Method**: `POST`
- **Path**: `/api/v1/credentials/issue-requests`
- **Source Level**: Spec Inference from wireframe issue start screens.
- **Description**: Starts a credential issuance flow for an eligible document/document type.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/credentials/issue-requests:
    post:
      summary: Create credential issue request
      operationId: createCredentialIssueRequest
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
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
          description: Unauthorized
        '409':
          description: Duplicate active issue request
        '502':
          description: Issuer response failure
```

### 3.2. Sign Handover Step
- **Method**: `POST`
- **Path**: `/api/v1/credentials/issue-requests/{issueRequestId}/signatures`
- **Source Level**: Wireframe Evidence.
- **Description**: Records the user's signature for the current handover step and advances the request when possible.

```yaml
paths:
  /api/v1/credentials/issue-requests/{issueRequestId}/signatures:
    post:
      summary: Sign credential handover step
      operationId: signCredentialHandover
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
        - in: path
          name: issueRequestId
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignCredentialHandoverReq'
      responses:
        '200':
          description: Signature accepted and current issue status returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommonResCredentialIssueRequestRes'
        '400':
          description: Invalid handover step or signature payload
        '403':
          description: Issue request owner mismatch
        '404':
          description: Issue request not found
        '409':
          description: Signature already recorded or request is not signable
```

### 3.3. List My Credentials
- **Method**: `GET`
- **Path**: `/api/v1/credentials`
- **Source Level**: Wireframe Evidence.
- **Description**: Returns the current user's wallet credentials with optional status filter.

```yaml
paths:
  /api/v1/credentials:
    get:
      summary: List my credentials
      operationId: listMyCredentials
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
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
          description: Unauthorized
```

### 3.4. Get My Credential Detail
- **Method**: `GET`
- **Path**: `/api/v1/credentials/{credentialId}`
- **Source Level**: Wireframe Evidence.
- **Description**: Returns metadata, current status, handover history, and submission history for a credential owned by the current user.

```yaml
paths:
  /api/v1/credentials/{credentialId}:
    get:
      summary: Get my credential detail
      operationId: getMyCredentialDetail
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
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
        '403':
          description: Credential owner mismatch
        '404':
          description: Credential not found
```

### 3.5. Submit Credential to Institution Request
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/submissions`
- **Source Level**: Wireframe Evidence.
- **Description**: Sends a valid credential to an institution request. Submission is blocked without a prior institution request.

```yaml
paths:
  /api/v1/credentials/{credentialId}/submissions:
    post:
      summary: Submit credential to institution request
      operationId: submitCredential
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
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
          description: Invalid institution request
        '403':
          description: Credential owner mismatch
        '404':
          description: Credential or submission request not found
        '409':
          description: Credential expired, revoked, or already submitted to the same request
```

### 3.6. Reissue Credential
- **Method**: `POST`
- **Path**: `/api/v1/credentials/{credentialId}/reissue`
- **Source Level**: Wireframe Evidence.
- **Description**: Starts a new issue request from an expired/revoked credential when reissue is allowed.

```yaml
paths:
  /api/v1/credentials/{credentialId}/reissue:
    post:
      summary: Reissue credential
      operationId: reissueCredential
      parameters:
        - in: header
          name: X-User-Id
          required: true
          schema:
            type: string
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
        '403':
          description: Credential owner mismatch
        '404':
          description: Credential not found
        '409':
          description: Credential is not reissuable
```

## 4. Draft Operator Endpoints Requiring Additional Auth Spec
These endpoints appear in the operations console wireframe but must not be implemented until Admin/Auth permissions are specified.

| Operation | Draft Path | Source |
| :--- | :--- | :--- |
| Operator credential revoke | `POST /api/v1/ops/credentials/{credentialId}/revoke` | `console/dispute-detail.html`, `console/member-detail.html` |
| Operator issue request force advance | `POST /api/v1/ops/credential-issue-requests/{issueRequestId}/force-advance` | `console/request-detail.html` |
| Operator member bulk credential revoke | `POST /api/v1/ops/members/{userId}/credentials/revoke` | `console/member-detail.html` |

## 5. Components (Schemas)

```yaml
components:
  schemas:
    CreateCredentialIssueRequestReq:
      type: object
      required: [documentTypeId]
      properties:
        documentTypeId:
          type: string
          description: Document type to issue as a credential.
        documentId:
          type: string
          nullable: true
          description: Existing document id when issuance is based on a completed Document flow.
        personaType:
          type: string
          nullable: true
          enum: [KOREAN, FOREIGNER]
          description: Optional persona override until User nationality/persona mapping is finalized.
    CreateCredentialIssueRequestRes:
      type: object
      properties:
        issueRequestId:
          type: string
        status:
          type: string
          enum: [ISSUING, SIGNATURE_REQUIRED, FAILED]
        requiredSignatureCount:
          type: integer
          example: 4
        completedSignatureCount:
          type: integer
          example: 0
        currentHandoverStep:
          type: integer
          nullable: true
        nextAction:
          type: string
          nullable: true
    SignCredentialHandoverReq:
      type: object
      required: [handoverStep, signature]
      properties:
        handoverStep:
          type: integer
          minimum: 1
          maximum: 4
        signature:
          type: string
          description: MVP signature payload or mock signature token.
        signedAt:
          type: string
          format: date-time
          nullable: true
    CredentialIssueRequestRes:
      type: object
      properties:
        issueRequestId:
          type: string
        credentialId:
          type: string
          nullable: true
        status:
          type: string
          enum: [ISSUING, SIGNATURE_REQUIRED, ISSUED, FAILED, REVOKED]
        requiredSignatureCount:
          type: integer
        completedSignatureCount:
          type: integer
        handovers:
          type: array
          items:
            $ref: '#/components/schemas/CredentialHandoverItem'
    CredentialSummary:
      type: object
      properties:
        credentialId:
          type: string
        documentTypeId:
          type: string
        documentTypeName:
          type: string
        issuerId:
          type: string
        issuerName:
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
        xrplCredentialId:
          type: string
          nullable: true
        isMock:
          type: boolean
    ListCredentialsRes:
      type: object
      properties:
        credentials:
          type: array
          items:
            $ref: '#/components/schemas/CredentialSummary'
    CredentialDetailRes:
      allOf:
        - $ref: '#/components/schemas/CredentialSummary'
        - type: object
          properties:
            issueRequestId:
              type: string
            handovers:
              type: array
              items:
                $ref: '#/components/schemas/CredentialHandoverItem'
            submissions:
              type: array
              items:
                $ref: '#/components/schemas/CredentialSubmissionItem'
            sourceDocumentRef:
              type: string
              nullable: true
    CredentialHandoverItem:
      type: object
      properties:
        step:
          type: integer
        label:
          type: string
        actorLabel:
          type: string
        status:
          type: string
          enum: [PENDING, SIGNATURE_REQUIRED, SIGNED, COMPLETED, FAILED]
        signedAt:
          type: string
          format: date-time
          nullable: true
        signatureHash:
          type: string
          nullable: true
    SubmitCredentialReq:
      type: object
      required: [submissionRequestId]
      properties:
        submissionRequestId:
          type: string
        consentConfirmed:
          type: boolean
          description: User confirmation for the institution submission.
    SubmitCredentialRes:
      type: object
      properties:
        submissionId:
          type: string
        credentialId:
          type: string
        recipientInstitutionId:
          type: string
        submittedAt:
          type: string
          format: date-time
    CredentialSubmissionItem:
      type: object
      properties:
        submissionId:
          type: string
        recipientInstitutionId:
          type: string
        recipientInstitutionName:
          type: string
        submittedAt:
          type: string
          format: date-time
        status:
          type: string
          enum: [SUBMITTED, ACCEPTED, REJECTED, DISPUTED]
```

## 6. Draft Error Codes Needed
These are proposed `ErrorCode.Credential.*` entries. Exact names must be approved when implementing.

| Draft Error | HTTP | Trigger |
| :--- | :--- | :--- |
| `CREDENTIAL_NOT_FOUND` | 404 | Credential id does not exist. |
| `CREDENTIAL_OWNER_MISMATCH` | 403 | Current user does not own the credential. |
| `CREDENTIAL_NOT_ISSUED` | 409 | Action requires an issued credential. |
| `CREDENTIAL_EXPIRED` | 409 | Credential expired before submission/use. |
| `CREDENTIAL_REVOKED` | 409 | Credential was revoked. |
| `CREDENTIAL_ALREADY_SUBMITTED` | 409 | Duplicate submission for same request. |
| `ISSUE_REQUEST_NOT_FOUND` | 404 | Issue request id does not exist. |
| `ISSUE_REQUEST_NOT_SIGNABLE` | 409 | Request is not waiting for signature. |
| `HANDOVER_STEP_INVALID` | 400 | Step is not the current or allowed step. |
| `HANDOVER_ALREADY_SIGNED` | 409 | Duplicate signature for a step. |
| `INSTITUTION_SUBMISSION_REQUEST_NOT_FOUND` | 404 | No matching institution request exists. |
| `INSTITUTION_REQUEST_REQUIRED` | 409 | User attempted submission without institution request. |
| `ISSUER_UNAVAILABLE` | 502 | Issuer/upstream mock failed or timed out. |
