# User API Specification

## 1. Overview
- **Base Path**: `/api/v1/users`
- **Description**: API for user registration, profile management, and account lifecycle.

## 2. Authentication & Authorization
- **Auth Strategy**: Bearer Token JWT (Web3Auth)
- **Required Roles/Permissions**: 
    - `POST /register`: Valid Web3Auth Token (before user registration)
    - `GET /me`, `DELETE /me`: Valid Web3Auth Token + Registered User Account

## 3. Endpoints

### 3.1. Register User (사용자 가입)
- **Method**: `POST`
- **Path**: `/register`
- **Description**: Registers a new user and their XRPL wallet. `verifier` and `verifierId` are extracted from the auth token.
- **Rules**:
    - Nationality must be ISO 3166-1 alpha-2.
    - XRPL Address and Email must be unique.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/users/register:
    post:
      summary: Register a new user
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterUserRequest'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '409':
          description: Conflict (Email or Wallet already exists)
```

### 3.2. Get My Profile (내 정보 조회)
- **Method**: `GET`
- **Path**: `/me`
- **Description**: Returns the authenticated user's profile and wallet information.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/users/me:
    get:
      summary: Get current user profile
      operationId: getMyProfile
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
```

### 3.3. Delete My Account (회원 탈퇴)
- **Method**: `DELETE`
- **Path**: `/me`
- **Description**: Soft deletes the user account by setting `isDelete` to true.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/users/me:
    delete:
      summary: Soft delete user account
      operationId: deleteAccount
      responses:
        '204':
          description: No Content
```

## 4. Components (Schemas)
```yaml
components:
  schemas:
    RegisterUserRequest:
      type: object
      required:
        - email
        - name
        - nationality
        - xrplAddress
        - publicKey
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        nationality:
          type: string
          example: "KR"
        xrplAddress:
          type: string
        publicKey:
          type: string
    UserResponse:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        nationality:
          type: string
        wallet:
          type: object
          properties:
            xrplAddress:
              type: string
        createdAt:
          type: string
          format: date-time
```
