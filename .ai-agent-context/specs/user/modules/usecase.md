# User Use Cases

## 1. RegisterUserUseCase
- **Actor**: Unregistered User (Authenticated via Web3Auth)
- **Input**: `email`, `name`, `nationality`, `xrplAddress`, `publicKey`, `verifier`, `verifierId`
- **Output**: Created `User` entity
- **Flow**:
    1. `verifier` 및 `verifierId` 중복 여부 확인.
    2. `email` 및 `xrplAddress` 중복 여부 확인.
    3. 국적 코드 유효성 검증.
    4. `User` 및 `UserWallet` 엔티티 생성 및 저장.

## 2. GetMyProfileUseCase
- **Actor**: Registered User
- **Input**: `userId`
- **Output**: `User` entity with `UserWallet`
- **Flow**:
    1. `userId`로 활성 상태(`isDelete: false`)의 사용자 조회.
    2. 연관된 `UserWallet` 정보를 함께 로드하여 반환.

## 3. DeleteAccountUseCase
- **Actor**: Registered User
- **Input**: `userId`
- **Output**: Success/Failure
- **Flow**:
    1. `userId`로 사용자 존재 여부 확인.
    2. 사용자의 `isDelete` 플래그를 true로 변경.
    3. 연관된 `UserWallet`의 상태도 필요 시 동기화 (또는 함께 Soft Delete).
