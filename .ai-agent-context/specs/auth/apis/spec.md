# Auth API Specification

## 1. Overview
- **Internal JWT Schema**
    - **Algorithm**: HS256
    - **Header**: `{"alg": "HS256", "typ": "JWT"}`
    - **Payload**:
      ```json
      {
        "sub": "string",   // User.id
        "email": "string", // User.email
        "iat": "number",   // Issued At
        "exp": "number"    // Expiration Time
      }
      ```

## 2. Authentication Flow
1. **Login**: `POST /api/v1/users/register` (or login) returns `accessToken`.
2. **Authorized Request**: Include `Authorization: Bearer <accessToken>` in headers.
