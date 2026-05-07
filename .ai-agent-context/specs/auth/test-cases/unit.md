# Auth Unit Test Cases

## 1. Token Issuance
- **TC_AUT_UNIT_001**: `IssueInternalTokenUseCase` should generate a valid JWT string containing the correct `sub` and `email`.

## 2. Token Verification
- **TC_AUT_UNIT_002**: `VerifyInternalTokenUseCase` should correctly extract data from a valid token.
- **TC_AUT_UNIT_003**: `VerifyInternalTokenUseCase` should throw an error if the token is expired.
- **TC_AUT_UNIT_004**: `VerifyInternalTokenUseCase` should throw an error if the token signature is invalid.
