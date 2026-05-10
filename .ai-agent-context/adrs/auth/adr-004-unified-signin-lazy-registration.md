# ADR-004: Unified Sign-In and Lazy Registration

## Status
- proposed

## Context
- **Problem**: Separate Login and Registration APIs increase friction for users and complexity for front-end developers.
- **Goal**: Provide a single "Sign-In" API that handles both existing users (Login) and new users (Registration) seamlessly.
- **Constraints**: 
    - Still require XRPL wallet information for new users.
    - Maintain strict validation of Web3Auth tokens.

## Decision
- **Our Choice**:
    - **Unified API**: Merge `POST /api/v1/auth/login` and `POST /api/v1/users/register` into a single `POST /api/v1/auth/signin`.
    - **Lazy Registration**: If the user (by `verifier` and `verifierId`) does not exist, use the provided metadata (`name`, `nationality`, `xrplAddress`, `publicKey`) to register them on the fly.
    - **Request Schema**: The `signin` request will include the Web3Auth token (in header) and registration metadata in the body.
    - **Response**: Always returns the same `AuthResponse` (User Profile + Internal JWT) regardless of whether it was a login or a registration.

## Rules (LLM Important)
- **MUST**:
  - Extract `verifier` and `verifierId` from the Web3Auth token as the unique identifier.
  - Fail with `BAD_REQUEST` if registration metadata is missing and user doesn't exist.
  - Use a database transaction to ensure atomicity when registering.
- **MUST NOT**:
  - Overwrite existing `xrplAddress` if a user already exists.
  - Allow multiple accounts for the same Web3Auth `verifierId`.

## Impact
- **Advantages**: Simplified front-end integration (one "Enter" button), better UX.
- **Disadvantages**: Slightly larger request payload for login (carrying registration data just in case).
- **Trade-offs**: UX and DX simplicity favored over minimal payload size.

## Scope
- **Affected Components**: AuthController, AuthFacade, UserService.
