# Auth Use Cases

## 1. IssueInternalTokenUseCase
- **Actor**: System (after successful external authentication)
- **Input**: `userId`, `email`
- **Output**: `accessToken` (string)
- **Flow**:
    1. 입력받은 사용자 정보를 바탕으로 JWT 페이로드 생성.
    2. 서버 비밀키로 서명하여 Access Token 발행.

## 2. VerifyInternalTokenUseCase
- **Actor**: System Guard (on every authorized request)
- **Input**: `accessToken`
- **Output**: `userId`, `email` (extracted and verified)
- **Flow**:
    1. 토큰의 서명 및 만료 시간 검증.
    2. 유효할 경우 페이로드에서 사용자 정보 추출하여 반환.
    3. 유효하지 않을 경우 (만료, 변조 등) 예외 발생.
