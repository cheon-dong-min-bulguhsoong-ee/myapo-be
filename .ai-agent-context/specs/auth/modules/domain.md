# Auth Domain Logic

## 1. Internal Access Token (Value Object)
- **Description**: 시스템 내부에서 신원 인증 및 인가를 위해 사용하는 자체 JWT.
- **Attributes**:
    - `userId`: MyApo 시스템의 사용자 고유 ID (sub)
    - `email`: 사용자의 이메일
    - `role`: 사용자의 권한 등급
    - `iat`: 토큰 발행 시각
    - `exp`: 토큰 만료 시각 (보통 발행 후 1시간)

## 2. Token Security Policy
- **Algorithm**: HS256 (대칭키 방식)
- **Secret Management**: 환경 변수 (`JWT_SECRET`)를 통해 서버 측에서만 관리.
- **Verification**: 서명(Signature) 유효성 및 만료 여부 검증 필수.
