# User Use Cases

## 1. GetMyProfileUseCase
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

## 4. LogoutUseCase
- **Actor**: Authenticated User
- **Input**: `userId`
- **Output**: Success
- **Flow**:
    1. (Server) Internal Access Token의 유효성을 검증하고 세션 종료를 기록(필요시).
    2. (Client-side Requirement) 클라이언트는 저장된 JWT를 폐기해야 함.
    3. (Optional) "계정 전환" 또는 "완전 로그아웃" 시 클라이언트에서 Web3Auth SDK의 `logout()`을 호출하여 외부 세션을 정리함.

## 5. ChangeUserRoleUseCase (Admin Only)
- **Actor**: Admin
- **Input**: `targetUserId`, `newRole`
- **Output**: Updated `User` entity
- **Flow**:
    1. 요청자(Actor)의 권한이 `ADMIN`인지 확인.
    2. `targetUserId`로 사용자 존재 여부 확인.
    3. 사용자의 `role`을 `newRole`로 변경 및 저장.
