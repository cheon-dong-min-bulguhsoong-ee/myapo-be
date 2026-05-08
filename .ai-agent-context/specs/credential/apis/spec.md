# Credential API Specification

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, mock XRPL metadata, user-facing APIs, nullable authEventId references. Excluded: operator APIs, production XRPL, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Base Path**: `/api/v1/credentials`
- **Response Envelope**: Every response must use `CommonRes<T>`.
- **Error Model**: All business errors must use `DomainError` and `ErrorCode`.
- **Auth Strategy**: Protected user APIs use Internal JWT from ADR-002: `Authorization: Bearer <accessToken>`. `X-User-Id` is legacy/test fallback only if living code requires it.

## 1. Overview
Credential APIs support the latest frontend-design model:
- Credential issue requests appear in the 5-stage issue pipeline.
- Credential submission is a heavy auth-gated action and creates one row per institution submission.
- Submission rows can link to an Auth-owned auth event id.
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
- **Description**: Returns current user's credentials with optional lifecycle tab/status filter.

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

### 3.4. Get My Credential Detail
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

### 3.5. Submit Credential to Institution Request
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

### 3.6. List Credential Submissions
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

### 3.7. Reissue Credential
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
| `ISSUE_REQUEST_NOT_FOUND` | 404 | Issue request id does not exist. |
| `ISSUE_REQUEST_NOT_ADVANCEABLE` | 409 | Issue request cannot advance in current state. |
| `INSTITUTION_SUBMISSION_REQUEST_NOT_FOUND` | 404 | No matching institution request exists. |
| `AUTH_EVENT_REQUIRED` | 400 | Required heavy-action auth evidence is missing. |
| `AUTH_EVENT_MISMATCH` | 409 | Auth event does not match user/action/object. |
