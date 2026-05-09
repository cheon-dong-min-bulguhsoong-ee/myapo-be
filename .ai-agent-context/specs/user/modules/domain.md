# User Domain Entities

## 1. User Entity
- **Description**: 시스템의 핵심 사용자 엔티티.
- **Attributes**:
    - `id`: Unique identifier (BigInt)
    - `email`: User's email address (Unique)
    - `name`: User's full name
    - `nationality`: ISO 3166-1 alpha-2 country code (Immutable after creation)
    - `role`: 시스템 권한 (USER, ADMIN, INSTITUTION)
    - `isDelete`: Soft delete flag
- **Business Logic**:
    - `validateNationality()`: 국적 코드가 올바른 ISO 포맷인지 검증.
    - `changeRole(newRole)`: 사용자의 권한을 변경.
    - `markAsDeleted()`: `isDelete` 플래그를 true로 설정.

## 2. UserWallet Entity
- **Description**: 사용자와 1:1로 매핑되는 XRPL 지갑 정보 엔티티.
- **Attributes**:
    - `userId`: Reference to User
    - `verifier`: Social login provider (e.g., "google")
    - `verifierId`: Unique ID from the provider (sub)
    - `xrplAddress`: Public XRPL address (Unique)
    - `publicKey`: Hex-encoded public key for signature verification
- **Business Logic**:
    - `verifySignature(message, signature)`: 저장된 `publicKey`를 사용하여 XRPL 서명 검증.
