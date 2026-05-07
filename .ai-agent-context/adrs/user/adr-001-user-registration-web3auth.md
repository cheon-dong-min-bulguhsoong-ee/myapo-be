# ADR-001: User Registration and Web3Auth Integration

## Status
- accepted

## Context
- **Current State**: Initial setup of the User domain. No registration or authentication logic exists.
- **Problem**: Need a secure, user-friendly onboarding process using Web3Auth (Google) that ensures data integrity and supports account lifecycle (registration, reactivation, soft-delete).
- **Constraints**: 
    - Use Web3Auth for authentication.
    - Strictly follow the 1:1 relationship between User and UserWallet.
    - Support Soft Delete (isDelete flag) and audit requirements.
- **Considerations**: Security vs. UX (detailed error messages), MVP speed vs. exhaustive verification (XRPL signature challenges).

## Decision
- **Our Choice**:
    - **Authentication**: Strict Google ID Token verification via 실시간 JWKS (Standard Web3Auth/OpenID Connect pattern). Extract `email`, `verifier`, and `verifierId` directly from the token as the Source of Truth.
    - **Re-registration/Reactivation**: If a user re-registers with an existing but deleted (`isDelete: true`) account, reactivate it by setting `isDelete: false`. Block reactivation if the provided `xrplAddress` differs from the existing record (Security block).
    - **Transaction Management**: Use Prisma `$transaction` for atomic creation/reactivation of User and UserWallet. Side-effects (lastLoginAt, notifications) are handled asynchronously outside the main registration transaction.
    - **Security**: Focus on MVP speed; rely on Web3Auth token validity for ownership proof without secondary XRPL signature challenges.
    - **Lifecycle**: Upon user deletion, immediately destroy/invalidate associated data (Documents) within the system for privacy, but retain the User record (with isDelete=true) for audit/legal compliance.

## Rules (LLM Important)
- **MUST**:
  - Verify Web3Auth tokens using standard JWKS libraries.
  - Prioritize data extracted from tokens over user-provided input for critical fields (email, verifierId).
  - Use `class-validator` (ISO 3166) for nationality validation.
  - Follow TDD: Complete all Unit Tests (Entities, Services) before starting Integration Tests.
  - Return detailed error messages (e.g., "Email already in use") to improve DX/UX.
- **MUST NOT**:
  - Perform physical deletion of User records.
  - Allow nationality updates after registration (Immutable).
- **SHOULD**:
  - Use camelCase for all API response fields.
  - Log reactivation events for auditing.

## Impact
- **Advantages**: Secure and standardized authentication, resilient to re-registration, clear data lifecycle.
- **Disadvantages**: Slightly higher complexity in token verification logic.
- **Trade-offs**: Sacrificed secondary XRPL ownership proof for implementation speed (MVP).

## Scope
- **Area of Application**: User Registration API and Domain Logic.
- **Affected Components**: User Entity, UserWallet Entity, RegisterUserUseCase, AuthGuard.

## Example

### Before
- N/A (Initial implementation)

### After
- `POST /api/v1/users/register` -> Verifies Token -> Checks Existing (Deleted/Active) -> Atomic Save -> Returns 201/409.

## Related
- domain: User
- api: `POST /api/v1/users/register`
- other adr: N/A
