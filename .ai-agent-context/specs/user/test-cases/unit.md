# User Unit Test Cases

## 1. User Entity
- **TC_USR_UNIT_001**: `validateNationality()` should throw an error if the nationality code is not a 2-letter ISO string.
- **TC_USR_UNIT_002**: `validateNationality()` should pass if the nationality code is a valid 2-letter ISO string (e.g., "KR", "US").
- **TC_USR_UNIT_003**: `markAsDeleted()` should set the `isDelete` flag to true.

## 2. UserWallet Entity
- **TC_USR_UNIT_004**: `verifySignature()` should return true for a valid XRPL signature and message.
- **TC_USR_UNIT_005**: `verifySignature()` should return false for an invalid XRPL signature.
