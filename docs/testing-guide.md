# MyApoBE Testing & Developer Guide

이 문서는 UI가 개발되기 전, 개발자들이 Documents 및 Credential API를 테스트할 수 있는 방법과 RBAC(Role-Based Access Control) 설정에 대해 설명합니다.

---

## 1. RBAC (Role-Based Access Control) 개요

시스템은 세 가지 주요 권한(Role)을 지원합니다:

- **USER**: 일반 사용자. 자신의 프로필 조회, 탈퇴, 문서 신청 및 조회 가능.
- **ADMIN**: 관리자. 모든 유저의 권한 변경(`PATCH /api/v1/users/:id/role`) 등 관리 기능 수행 가능.
- **INSTITUTION**: 발급 기관. (향후 기관 전용 API 접근 권한으로 사용 예정)

모든 권한은 내부 JWT(Internal Access Token)의 Payload에 포함되어 있으며, `RolesGuard`를 통해 검증됩니다.

---

## 2. 테스트용 계정 생성 (SQL)

UI 없이 API를 테스트하려면 DB에 직접 유저 정보를 삽입해야 합니다. 다음 SQL을 실행하여 기본 테스트 계정을 생성할 수 있습니다.

```sql
-- 1. 테스트용 유저 생성
-- role: USER, ADMIN, INSTITUTION 중 선택
INSERT INTO tosalpee.users (id, email, name, nationality, role, status)
VALUES 
    (1, 'user@test.com', 'Test User', 'KR', 'USER', 'ACTIVE'),
    (2, 'admin@test.com', 'Test Admin', 'KR', 'ADMIN', 'ACTIVE'),
    (3, 'institution@test.com', 'Test Institution', 'VN', 'INSTITUTION', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 2. 유저 지갑 연결 (1:1 관계)
INSERT INTO tosalpee.user_wallets (user_id, verifier, verifier_id, xrpl_address, public_key)
VALUES 
    (1, 'google', 'sub-user-123', 'rUserTestAddress11111111111111', '02690B82D704E369688463B8B884E0C3E96D49F988463B8B884E0C3E96D49F988'),
    (2, 'google', 'sub-admin-456', 'rAdminTestAddress22222222222222', '03790B82D704E369688463B8B884E0C3E96D49F988463B8B884E0C3E96D49F988'),
    (3, 'google', 'sub-inst-789', 'rInstTestAddress33333333333333', '02890B82D704E369688463B8B884E0C3E96D49F988463B8B884E0C3E96D49F988')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 3. 테스트용 JWT 토큰

아래 토큰들은 기본 `JWT_SECRET`(`myapo-dev-secret-key-2026`)을 기준으로 생성되었습니다. 유효기간은 발행일로부터 **1년**입니다.

### 3.1. USER 토큰 (ID: 1)
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ1c2VyQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzgzMzI0MjMsImV4cCI6MTgwOTg2ODQyM30.xe21byJlN6BH_ltnYRVGrfesbJl6OhuFSAV-fo8-L_8
```

### 3.2. ADMIN 토큰 (ID: 2)
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3ODMzMjQyMywiZXhwIjoxODA5ODY4NDIzfQ.ZSxgfcjklwc9RsnsLmUi2gzEVFE3DaIOjrejo-_bB_o
```

### 3.3. INSTITUTION 토큰 (ID: 3)
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwiZW1haWwiOiJpbnN0aXR1dGlvbkB0ZXN0LmNvbSIsInJvbGUiOiJJTlNUSVRVVElPTiIsImlhdCI6MTc3ODMzMjQyMywiZXhwIjoxODA5ODY4NDIzfQ.ZK2ZiKUyKBzjOqDwVMduyJGx4e_8XRdBToMTrtKYM8M
```

> **주의**: 만약 `.env` 파일에 다른 `JWT_SECRET`이 설정되어 있다면 위 토큰은 사용할 수 없습니다. 이 경우 서버 로그 또는 내부 가이드를 통해 새로운 토큰을 요청하세요.

---

## 4. API 테스트 예시 (cURL)

### 내 프로필 조회 (Any Role)
```bash
curl -X GET http://localhost:4000/api/v1/users/me \
     -H "Authorization: Bearer <JWT_TOKEN>"
```

### 유저 권한 변경 (ADMIN Only)
```bash
curl -X PATCH http://localhost:4000/api/v1/users/1/role \
     -H "Authorization: Bearer <ADMIN_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"role": "ADMIN"}'
```

### Credential 목록 조회 (USER Only)
```bash
curl -X GET http://localhost:4000/api/v1/credentials \
     -H "Authorization: Bearer <USER_TOKEN>"
```
