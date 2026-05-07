# [Domain Name] E2E Test Cases

## 1. User Journey: [Journey Name] (e.g., Complete Onboarding)
High-level verification of a full business process from an external perspective (API).

### Case: [Case Name] (e.g., Successful Registration and Login)
1.  **Request**: `POST /api/v1/auth/register` with valid data.
2.  **Response**: Expect `201 Created`.
3.  **Request**: `POST /api/v1/auth/login` with registered credentials.
4.  **Response**: Expect `200 OK` and a valid `accessToken`.

### Case: [Failure Case Name] (e.g., Unauthorized Access to Protected Resource)
1.  **Request**: `GET /api/v1/[domain]/protected` without token.
2.  **Response**: Expect `401 Unauthorized`.
