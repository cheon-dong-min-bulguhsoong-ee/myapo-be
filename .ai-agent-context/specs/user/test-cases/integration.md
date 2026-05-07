# User Integration Test Cases

## 1. RegisterUserUseCase
- **TC_USR_INT_001**: Should throw `ConflictException` when registering with an email that already exists.
- **TC_USR_INT_002**: Should throw `ConflictException` when registering with an XRPL address that already exists.
- **TC_USR_INT_003**: Should throw `ConflictException` when registering with a (Verifier, VerifierID) pair that already exists.
- **TC_USR_INT_004**: Should successfully create User and UserWallet in the database within a single transaction.

## 2. GetMyProfileUseCase
- **TC_USR_INT_005**: Should return the user's profile and wallet info for a valid `userId`.
- **TC_USR_INT_006**: Should throw `NotFoundException` if the user is marked as deleted (`isDelete: true`).

## 3. DeleteAccountUseCase
- **TC_USR_INT_007**: Should mark the user as deleted in the database.
