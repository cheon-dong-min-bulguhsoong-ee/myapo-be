## Intro

`MyApo`는 재한 외국인과 재외 한국인이 해외 금융·행정 절차에 필요한 공문서와 아포스티유를 더 빠르고 안전하게 제출할 수 있도록, 발급 주체·문서 단계·검증 기록을 표준화하는 디지털 아포스티유 플랫폼입니다.

> 🚀 KFIP 2026 카테고리 기준으로 `MyApo`는 **디지털 신원**, **기타 금융/인프라**에 해당합니다.

## Background & Problem

재한 외국인이 본국 금융기관, 학교, 행정기관에 한국 발급 서류를 제출하거나 재외 한국인이 해외 발급 서류를 한국 기관에 제출하려면 정부 발급, 번역공증, 아포스티유, 국제 송부를 직접 처리해야 합니다.

- 현재 이 과정은 평균 약 8주가 걸리고 종합 비용이 30만 원 이상 발생합니다.
- 문서 위조가 적발돼도 발급, 번역공증, 아포스티유, 송부 중 어느 단계에서 문제가 들어왔는지 입증하기 어렵습니다.

## Solution

MyApo는 이 네 단계를 하나의 디지털 플로우로 묶습니다.

- 사용자는 최초 신청 후 단계별 확인과 동의만 수행하고, 정부 발급 주체, 번역공증사, 아포스티유 처리 기관, 최종 수령자는 XRPL 위의 검증 가능한 인증서와 권한 도메인을 통해 각자의 역할을 수행합니다.
- 원본 문서와 개인정보는 온체인에 올리지 않고 암호화해 오프체인에 보관하며, XRPL에는 발급 주체, 권한, 단계별 검증 기록, 분쟁 추적에 필요한 증명 정보만 남깁니다.

## Result

- 외국인과 재외 국민이 해외 금융 계좌 개설, 송금, 유학, 취업, 가족관계 증빙 등 cross-border 금융·행정 절차를 진행할 때 필요한 신원·문서 검증 병목을 해결합니다.
- 동시에 XLS-70 Credentials와 XLS-80 Permissioned Domains를 활용하는 compliance-first 금융 인프라로서 XRPL 생태계의 규제 친화적 활용 사례를 제시합니다.

---

## Demo 

### You need

- Google ID 혹은 Email 직접 입력  
- X(Twitter), Kakao, Line **(지원 예정)**

### App & API

- ⭐️ Our demo: https://app.myapo.xyz
- Wireframe: https://design.myapo.xyz
- Check API in Swagger: https://api.myapo.xyz/docs

### Scenario 

- 🔥 Demo Video: [Click here!](https://www.youtube.com/watch?v=o54uknVbJJI)
- 👀 Demo Slides: [Click here!](https://docs.google.com/presentation/d/1b1pUuLNZj7ylIwwGOsYP0mhWofAe-wLd6IJqA6m9KKA/edit?usp=sharing)


---

> 🎯 여기서부터 `myapo-be`를 구현 및 실행하기 위해 필요한 정보를 제공합니다.

## Environments

| Type           | Name                     | Version |
|----------------|--------------------------|---------|
| Runtime        | Node.js                  | 24+     |
| Framework      | NestJS                   | -       |
| Database       | PostgreSQL               | -       |
| Object Storage | S3                       | -       |
| Blockchain     | XRPL                     | -       |
| AI             | Claude Code/Gemini/Codex | -       |


## XRPL Native Tech Stack

| Standards | Name                 | Transaction              | Status | Notes |
|-----------|----------------------|--------------------------|-------|-------|
| XLS-40    | DID                  | DIDSet                   | 예정    |       |
|     |                   | DIDGet                   | 예정    |       |
|     |                   | DIDDelete                | 예정    |       |
| XLS-70    | Credentials          | CredentialCreate         | 적용    |       |
|           |                      | CredentialAccept         | 적용    |       |
|           |                      | CredentialDelete         | 진행중   |       |
| XLS-80    | Permissioned Domains | PermissionedDomainSet    | 예정    |       |
|           |                      | PermissionedDomainDelete | 예정    |       |
| XLS-85    | Token Escrow         | EscrowCreate             | 예정    |       |
|           |                      | EscrowFinish             | 예정    |       |
|           |                      | EscrowCancel             | 예정    |       |
| -         | RLUSD                |                          | 검토중   |       |


## Tech Stack

| Type          | Tech            | Version      |
| ------------- | --------------- | ------------ |
| Language      | TypeScript      | 5.6.2        |
| Web Framework | NestJS          | 11.0.7       |
| XRPL          | xrpl.js         | 4.6.0        |
| ORM           | Prisma          | 5.22.0       |
| Runtime       | Node.js         | 24.4.1       |
| Testing       | Jest/Supertest  | 29.7.0/7.0.0 |
| Auth          | Web3Auth/JWT    | -            |
| Docs          | Swagger/OpenAPI | 3.0          |

## How to start myapo-be

### Install & Build

```
npm install 
npx prisma generate
npm run build 
```

### Run

```
// dev
npm run start:dev 

// production
npm run start:prod
```


> ⚠️ 실행 전에 `.env` 파일 필요

```env
DATABASE_URL="postgresql://<user_name>:<password>@<ip>:<port>/postgres?schema=<schema_name>"

# Application
PORT=4000
NODE_ENV=development # or production 

# Auth - External
GOOGLE_OAUTH_CLIENT_ID="" 
WEB3AUTH_CLIENT_ID="" 
WALLET_SEED="" # 

# Auth — Internal
JWT_SECRET=""
JWT_EXPIRES_IN=1h

# Object Storage
S3_ENDPOINT=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET=""
```


> ⚠️ 스키마 동기화 필요시

```bash
// 스키마를 변경하고 아직 데이터베이스를 업데이트 하지 않았다면 
npx prisma db push

// 마이그레이션 필요시 
npx prisma migrate dev --name init 

// 데이터베이스 드롭 후 새로 마이그레이션 필요시
rm -rf ./prisma/migrations
npx prisma migrate dev --name init
```

