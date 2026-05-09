# Auth Use Cases

## 1. LoginUseCase
- **Actor**: User (via client application)
- **Input**: Web3Auth ID Token
- **Output**: Internal Access Token and User Profile
- **Pre-condition**: User must be registered in the system.
- **Flow**:
    1.  `Web3AuthGuard` intercepts the request and verifies the external ID Token. On success, it extracts the user's social profile (`email`, `verifier`, `verifierId`).
    2.  `AuthController.login` receives the social profile and passes it to `AuthFacade.login`.
    3.  `AuthFacade` calls `UserService.login`, providing the social profile details.
    4.  `UserService` finds the active user by `verifier` and `verifierId`.
    5.  `UserService` updates the user's `lastLoginAt` and syncs the `email` from the token.
    6.  `AuthFacade` receives the user result and calls `AuthService.issueAccessToken` to generate an Internal JWT.
    7.  The facade returns the user profile along with the new Internal JWT.

## 2. LogoutUseCase
- **Actor**: Authenticated User
- **Input**: Internal Access Token (via `Authorization` header)
- **Output**: Success confirmation
- **Flow**:
    1.  `JwtAuthGuard` verifies the Internal JWT and extracts the `userId`.
    2.  `AuthController.logout` calls `AuthFacade.logout` with the `userId`.
    3.  `AuthFacade` calls `AuthService.logout`.
    4.  `AuthService` performs server-side invalidation if applicable (e.g., adding to a blacklist). In the current stateless model, this is a no-op.
    5.  The client is responsible for deleting the stored JWT to complete the logout.

## 3. VerifyInternalTokenUseCase (System)
- **Actor**: System Guard
- **Input**: `accessToken`
- **Output**: Verified user payload (`userId`, `email`, `role`)
- **Flow**:
    1.  Validates the token's signature and expiration.
    2.  Returns the payload if valid, throws an error otherwise.
