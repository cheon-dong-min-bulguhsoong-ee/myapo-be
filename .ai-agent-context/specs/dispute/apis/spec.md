# Dispute API Specification

## 1. Overview
- **Base Path**: `/api/v1/disputes`
- **Description**: API for managing user grievances regarding issued credentials, including filing, assignment, review, and resolution.

## 2. Authentication & Authorization
- **Auth Strategy**: Bearer Token JWT (Web3Auth for Users, Custom for Admins/Operators)
- **Required Roles/Permissions**: `USER` (to file), `ADMIN` (to assign/reopen), `OPERATOR` (to review/resolve)

## 3. Endpoints

### 3.1. File Dispute (User)
- **Method**: `POST`
- **Path**: `/`
- **Description**: Allows a user to file a grievance against a completed issuance request.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/disputes:
    post:
      summary: File a new dispute
      operationId: fileDispute
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FileDisputeRequest'
      responses:
        '201':
          description: Dispute filed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DisputeResponse'
```

### 3.2. Get My Dispute List (User)
- **Method**: `GET`
- **Path**: `/`
- **Description**: Retrieves a list of disputes filed by the authenticated user.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/disputes:
    get:
      summary: Get my disputes
      operationId: getMyDisputes
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DisputeListResponse'
```

### 3.3. Get Dispute List (Admin/Operator)
- **Method**: `GET`
- **Path**: `/`
- **Description**: Retrieves a list of disputes with filtering. (Note: Implementation for Admin/Operator list may vary or use query params)

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/disputes:
    get:
      summary: List disputes
      operationId: getDisputeList
      parameters:
        - name: status
          in: query
          schema:
            type: string
        - name: operatorId
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Success
```

### 3.3. Resolve Dispute (Operator)
- **Method**: `POST`
- **Path**: `/{id}/resolve`
- **Description**: Finalizes the dispute with a resolution decision and optional linked actions.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/disputes/{id}/resolve:
    post:
      summary: Resolve or Reject a dispute
      operationId: resolveDispute
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResolveDisputeRequest'
      responses:
        '200':
          description: Dispute resolved
```

## 4. Components (Schemas)
```yaml
components:
  schemas:
    FileDisputeRequest:
      type: object
      required: [requestId, targetStage, type, headline, reason]
      properties:
        requestId: { type: string }
        targetStage: { type: string, description: "The pipeline stage being disputed (e.g., AUTHORITY_ISSUED, TRANSLATED_NOTARIZED)" }
        type: { type: string, enum: [TYPO, MISSING_CONTENT, IMAGE_QUALITY, REISSUE_REQUIRED, OTHERS] }
        sourceCode: { type: string }
        headline: { type: string }
        reason: { type: string }
        evidenceFiles:
          type: array
          items: { $ref: '#/components/schemas/FileInfo' }
    ResolveDisputeRequest:
      type: object
      required: [finalStatus, reason]
      properties:
        finalStatus: { type: string, enum: [RESOLVED, REJECTED] }
        reason: { type: string }
        messageToUser: { type: string }
        executeRevoke: { type: boolean }
        executeReissue: { type: boolean }
    DisputeResponse:
      type: object
      properties:
        id: { type: string }
        status: { type: string }
        type: { type: string }
        targetStage: { type: string }
        requestId: { type: string }
        requesterId: { type: string }
        operatorId: { type: string, nullable: true }
        slaDeadline: { type: string, format: date-time }
        isSlaPaused: { type: boolean }
        timeline:
          type: array
          items: { $ref: '#/components/schemas/TimelineEntry' }
        createdAt: { type: string, format: date-time }
    DisputeSummaryResponse:
      type: object
      properties:
        id: { type: string }
        status: { type: string }
        type: { type: string }
        targetStage: { type: string }
        requestId: { type: string }
        operatorId: { type: string, nullable: true }
        slaDeadline: { type: string, format: date-time }
        createdAt: { type: string, format: date-time }
    DisputeListResponse:
      type: object
      properties:
        disputes:
          type: array
          items: { $ref: '#/components/schemas/DisputeSummaryResponse' }
    TimelineEntry:
      type: object
      properties:
        id: { type: string }
        status: { type: string }
        note: { type: string, nullable: true }
        operatorId: { type: string, nullable: true }
        isInternal: { type: boolean }
        createdAt: { type: string, format: date-time }
    FileInfo:
      type: object
      properties:
        name: { type: string }
        size: { type: string }
        hash: { type: string }
        kind: { type: string }
```
