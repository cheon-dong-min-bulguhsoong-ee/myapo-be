# Auth Functional Requirements

## 1. Core Scenarios

### Scenario: User Login & Application Session Creation
- **Given** A user has successfully authenticated with an external provider via Web3Auth (e.g., Google).
- **And** The client has obtained a valid Web3Auth ID Token.
- **When** The client sends the ID Token to the server's `/api/v1/auth/login` endpoint.
- **Then** The server MUST verify the ID Token's signature and claims.
- **And** The server MUST find the corresponding user in its database.
- **And** The server MUST update the user's `lastLoginAt` and synchronize their `email`.
- **And** The server MUST issue a new Internal JWT (Access Token) for the application session.
- **And** The client receives the Internal JWT to use for subsequent API calls.

### Scenario: API Access with Internal JWT
- **Given** An authenticated user has a valid Internal JWT.
- **When** The user makes a request to a protected endpoint with the JWT in the `Authorization` header.
- **Then** The server's guard MUST validate the JWT.
- **And** If valid, the request is processed, and the user's identity is available in the context.

### Scenario: Application Session Logout
- **Given** An authenticated user wants to log out from the application.
- **When** The client sends a request to `/api/v1/auth/logout` with a valid Internal JWT.
- **Then** The server acknowledges the request (and can trigger server-side invalidation if implemented).
- **And** The client MUST delete the stored Internal JWT, effectively ending the application session.
