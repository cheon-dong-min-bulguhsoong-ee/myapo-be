# Glossary

- **Purpose**: Glossary for Linguistic Alignment via **Ubiquitous Language**.
- **Role**: Mandatory reference for Auth domain.

## Auth Domain

- **External Token (ID Token)**: Web3Auth(Google)에서 발행한 사용자 인증용 토큰.
- **Internal JWT (Access Token)**: MyApo 서버에서 발행하는 자체 인증 토큰. 이후 모든 API 요청 시 사용됨.
- **Payload**: JWT 내부에 저장된 사용자 데이터 (Claims).
- **Sub (Subject)**: 토큰의 주체로, MyApo 시스템의 `User.id` (BigInt string).
- **IAT (Issued At)**: 토큰 발행 시각.
- **EXP (Expiration Time)**: 토큰 만료 시각.
