# Auth API Specification

## 1. Overview
- **Base Path**: `/api/v1/auth`
- **Description**: API for user authentication, session management, and token issuance.

## 2. Authentication Flow
1.  **External Auth**: The client authenticates with Web3Auth to get an ID Token.
2.  **Login**: The client sends the ID Token to `POST /api/v1/auth/login`. The server verifies it and returns an Internal JWT.
3.  **Session**: The client uses the Internal JWT in the `Authorization: Bearer <token>` header for all subsequent protected API calls.
4.  **Logout**: The client calls `POST /api/v1/auth/logout` and deletes the stored Internal JWT.

## 3. Endpoints

### 3.1. Login
- **Method**: `POST`
- **Path**: `/login`
- **Description**: Verifies a Web3Auth ID Token, logs the user in, and returns an Internal JWT for the application session.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/auth/login:
    post:
      summary: User Login
      description: Verifies Web3Auth ID token and returns an internal session token.
      operationId: login
      security:
        - Web3AuthBearer: []
      responses:
        '201':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Unauthorized (Invalid Web3Auth Token)
        '404':
          description: User not found for the given social account
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
