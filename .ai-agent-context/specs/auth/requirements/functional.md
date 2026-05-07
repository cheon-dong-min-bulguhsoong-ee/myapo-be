# Auth Functional Requirements

## 1. Core Scenarios

### Scenario: Issue Internal JWT after Web3Auth Login
- **Given** A user has successfully verified their Web3Auth ID Token.
- **And** The user exists in the MyApo database.
- **When** The authentication process is complete.
- **Then** The system issues an Internal JWT (Access Token) containing the user's ID and email.

### Scenario: Authenticate Request using Internal JWT
- **Given** An incoming HTTP request with a `Authorization: Bearer <JWT>` header.
- **When** The system verifies the JWT signature and expiration.
- **Then** The request is allowed, and the user's ID is injected into the request context.
