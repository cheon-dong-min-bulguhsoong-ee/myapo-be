# ADR-002: Authentication and Session Management

## Status
- accepted

## Context
- **Current State**: System uses JWT (Internal Access Token) for authentication after Web3Auth verification.
- **Problem**: Need to define the strategy for session management and logout in a stateless JWT environment.
- **Constraints**: 
    - Maintain Clean Architecture and domain isolation.
    - Support stateless scalability.
- **Considerations**: Security (Token revocation) vs. Complexity (Redis/DB Blacklist).

## Decision
- **Our Choice**:
    - **Session Strategy**: Strictly Stateless JWT. The server does not maintain session state.
    - **Logout Strategy**: Client-side disposal. Upon logout, the client must destroy the stored Access Token.
    - **Token Revocation**: Not implemented in the MVP phase. If high security is required in the future, a Redis-based Blacklist will be introduced at the Infrastructure layer without changing the Domain logic.
    - **Data Synchronization**: During every login/registration, the user's `email` is synchronized from the Web3Auth token (Source of Truth), and `lastLoginAt` is updated for audit/analytics.

## Rules (LLM Important)
- **MUST**:
  - Update `lastLoginAt` on every successful login/registration.
  - Prioritize email from the token over the existing DB record if they differ.
- **MUST NOT**:
  - Store JWTs in the database for session tracking (Keep it stateless).
- **SHOULD**:
  - Implement a no-op `logout` endpoint to provide a consistent API for clients, allowing for future expansion.

## Impact
- **Advantages**: High scalability, low complexity, clear data lifecycle.
- **Disadvantages**: Cannot revoke a token until it naturally expires.
- **Trade-offs**: Sacrificed immediate revocation for implementation speed and horizontal scalability.

## Scope
- **Area of Application**: Auth Domain, User Domain (Login side-effects).
- **Affected Components**: AuthFacade, UserService, UserRepository.

## Example

### Before
- `logout` was a placeholder without documented rationale. `lastLoginAt` was not updated.

### After
- `logout` is documented as client-side disposal. `lastLoginAt` and `email` are updated on login.

## Related
- adr: ADR-001 (User Registration)
