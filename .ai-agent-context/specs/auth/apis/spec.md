# Auth API Specification

## 1. Overview
- **Base Path**: `/api/v1/auth`
- **Description**: API for user authentication, session management, and token issuance.

## 2. Authentication Flow
1.  **External Auth**: The client authenticates with Web3Auth to get an ID Token.
2.  **Sign-In**: The client sends the ID Token and optional registration metadata to `POST /api/v1/auth/signin`. The server verifies the token.
    - If the user exists, it updates `lastLoginAt` and returns an Internal JWT.
    - If the user does not exist, it registers the user using the provided metadata and returns an Internal JWT.
3.  **Session**: The client uses the Internal JWT in the `Authorization: Bearer <token>` header for all subsequent protected API calls.
4.  **Logout**: The client calls `POST /api/v1/auth/logout` and deletes the stored Internal JWT.

## 3. Endpoints

### 3.1. Sign-In
- **Method**: `POST`
- **Path**: `/signin`
- **Description**: Unified endpoint for login and registration. Verifies a Web3Auth ID Token. If the user is new, it performs registration using the provided metadata.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/auth/signin:
    post:
      summary: User Sign-In (Login/Register)
      description: Verifies Web3Auth ID token. Registers user if not exists.
      operationId: signin
      security:
        - Web3AuthBearer: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignInRequest'
      responses:
        '201':
          description: Sign-in successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Bad Request (Missing registration metadata for new user)
        '401':
          description: Unauthorized (Invalid Web3Auth Token)
```

### 3.2. Logout
- **Method**: `POST`
- **Path**: `/logout`
- **Description**: Logs the user out from the application session.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/auth/logout:
    post:
      summary: User Logout
      description: Invalidates the user's application session.
      operationId: logout
      security:
        - InternalJwtBearer: []
      responses:
        '200':
          description: Logout successful
        '401':
          description: Unauthorized (Invalid or missing Internal JWT)
```

## 4. Components (Schemas & Security)
```yaml
components:
  schemas:
    SignInRequest:
      type: object
      properties:
        name:
          type: string
        nationality:
          type: string
          example: "KR"
        xrplAddress:
          type: string
        publicKey:
          type: string
    AuthResponse:
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
        role:
          type: string
          enum: [USER, ADMIN, INSTITUTION]
        wallet:
          type: object
          properties:
            xrplAddress:
              type: string
        createdAt:
          type: string
          format: date-time
        accessToken:
          type: string
          description: The Internal JWT for the application session.
  securitySchemes:
    Web3AuthBearer:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Bearer token containing the Web3Auth ID Token.
    InternalJwtBearer:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Bearer token containing the server's internal JWT.
```
