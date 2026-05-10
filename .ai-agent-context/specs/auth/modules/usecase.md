# Auth Use Cases

## 1. SignInUseCase
- **Actor**: User (via client application)
- **Input**: Web3Auth ID Token, Registration Metadata (optional: `name`, `nationality`, `xrplAddress`, `publicKey`)
- **Output**: Internal Access Token and User Profile
- **Flow**:
    1.  `Web3AuthGuard` intercepts the request and verifies the external ID Token. On success, it extracts the user's social profile (`email`, `verifier`, `verifierId`).
    2.  `AuthController.signin` receives the social profile and optional registration metadata, passing them to `AuthFacade.signin`.
    3.  `AuthFacade` calls `UserService.signIn`, providing the social profile and registration details.
    4.  `UserService` checks if an active user exists by `verifier` and `verifierId`.
    5.  **If user exists**:
        - Updates `lastLoginAt` and syncs `email`.
    6.  **If user does not exist**:
        - Validates that registration metadata is present.
        - Checks for duplicate `email` or `xrplAddress`.
        - Performs atomic registration of `User` and `UserWallet`.
    7.  `AuthFacade` receives the user result and calls `AuthService.issueAccessToken`.
    8.  The facade returns the user profile and Internal JWT.

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
