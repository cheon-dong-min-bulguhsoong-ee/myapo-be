# User E2E Test Cases

## 1. User Registration
- **TC_USR_E2E_001**: `POST /api/v1/users/register` returns 201 Created and the user's profile data when called with a valid Web3Auth token and unique details.
- **TC_USR_E2E_002**: `POST /api/v1/users/register` returns 409 Conflict when details are duplicated.

## 2. Profile Management
- **TC_USR_E2E_003**: `GET /api/v1/users/me` returns 200 OK and profile details for an authenticated user.
- **TC_USR_E2E_004**: `GET /api/v1/users/me` returns 401 Unauthorized when the auth token is missing or invalid.

## 3. Account Lifecycle
- **TC_USR_E2E_005**: `DELETE /api/v1/users/me` returns 204 No Content and successfully soft deletes the account.
