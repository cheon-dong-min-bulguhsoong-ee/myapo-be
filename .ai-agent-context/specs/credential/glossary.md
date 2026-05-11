# Credential Glossary

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Primary Sources**:
  - `.ai-agent-context/references/frontend-design/Readme.md` (single truth for latest wireframe behavior)
  - `.ai-agent-context/references/frontend-design/*.html`
  - `.ai-agent-context/adrs/auth/adr-002-authentication-and-session-management.md`
  - `.ai-agent-context/specs/auth/apis/spec.md`
  - `.ai-agent-context/references/XRPL-Standards/XLS-0070-credentials/README.md`
- **Evidence Boundary**: Terms marked `Reference Evidence` are visible in latest `.ai-agent-context/references/frontend-design`. Terms marked `ADR Evidence` are accepted decisions. Terms marked `Spec Inference` are proposed backend terms that require approval before implementation.

## 1. Primary Business Concepts

| Business Term | System Key (Code) | Source Level | Shared Definition | Concrete Example |
| :--- | :--- | :--- | :--- | :--- |
| **Credential** | `Credential` | Reference Evidence | User-held credential result shown in the console and user app. It can be created, accepted, submitted, expired, revoked, or failed. | `크레덴셜 ID`, valid document tab row. |
| **XRPL Credential Testnet Evidence** | `XrplCredentialTestnetEvidence` | Hackathon Decision | XRP Testnet XLS-70 transaction evidence used for hackathon review. It may include transaction hash, ledger index, validation result, and on-ledger Credential object snapshot. It must not claim production/mainnet finality. | Testnet `CredentialCreate` / `CredentialAccept` / `CredentialDelete` tx log. |
| **발급 요청** | `CredentialIssueRequest` | Reference Evidence | A request that moves through the document/credential issuance pipeline until a credential exists or fails. | `REQ-...` in document management and request detail. |
| **5단계 발급 파이프라인** | `IssuePipelineStage` | Reference Evidence | Operations pipeline used by latest console: 접수, 사전 검토, 번역/검수, 공증 서명, 발급 완료. | Document management accordion and request detail pipeline. |
| **사용자 승인 / 서명** | `UserApproval` / `UserSignature` | Reference Evidence | User confirmation required for heavy actions. Exact signature count remains a product decision. | `사용자 승인`, previous wireframe `사용자 서명`. |
| **사용자 지갑** | `UserWallet` | Reference Evidence | Destination/account associated with issued credential metadata. | Request detail `지갑 주소`. |
| **유효한 문서** | `ACCEPTED` | Reference Evidence | Credential has been accepted and can be used before expiration/revocation. | Document management `valid` tab. |
| **문서 stage 기반 크레덴셜** | `DocumentStageCredential` | Spec Inference | Credentials that are grouped by `credential_issue_requests.current_stage` snapshot. The list view derives whether `CredentialAccept` has completed. | Issue pipeline stage detail -> credential list. |
| **기관 제출** | `CredentialSubmission` | Reference Evidence | One submission event for a credential to an institution. Row unit is submission, not credential. | `SUB-...`; one credential submitted to N institutions creates N rows. |
| **기관 제출 결과** | `CredentialSubmissionStatus` | Reference Evidence | Institution submission result state: received, verifying, or rejected. | `received`, `verifying`, `rejected` badges. |
| **인증 로그** | `AuthLog` | Reference Evidence | Operations log for heavy action identity verification. Auth owns the log. | Auth page table with linked object id. |
| **트리거 3종** | `AuthTriggerType` | Reference Evidence | Auth gates are limited to issue request, institution submit, dispute report. | `issue_request`, `institution_submit`, `dispute_report`. |
| **CI 불일치 차단** | `CiMismatchBlocked` | Reference Evidence | Auth failure category where reauthentication CI differs from the user account CI. | Auth log failure filter. |
| **만료된 문서** | `EXPIRED` | Reference Evidence | Credential validity period has ended. Submission must be blocked. | Document management `expired` tab. |
| **폐기된 문서** | `FAILED` | Reference Evidence | Credential has been invalidated by expiration cleanup, dispute/operator action, or lifecycle policy. | Document management `revoked` tab; dispute action `크리덴셜 폐기`. |
| **분쟁 전환** | `DisputeConversion` | Reference Evidence | Rejected institution submission can start a dispute with prefilled rejection context. Dispute owns the case. | Submitted row accordion `분쟁 신고로 전환`. |
| **생성 완료 크레덴셜** | `CREATED` | Spec Inference | CredentialCreate has completed but no CredentialAccept evidence exists yet. | Issue pipeline stage credential list. |
| **수락 완료 크레덴셜** | `ACCEPTED` | Spec Inference | CredentialCreate and CredentialAccept evidence both exist. | Issue pipeline stage credential list. |
| **Internal JWT** | `InternalJwtBearer` | ADR Evidence | Server-issued stateless JWT used for protected APIs after Web3Auth login. | `Authorization: Bearer <accessToken>`. |
| **X-User-Id** | `LegacyUserIdHeader` | Spec Inference | Legacy/test-only fallback seen in older code; not the preferred contract for new Credential APIs after ADR-002. | `X-User-Id` temporary header. |

## 2. Status & Lifecycle

| Friendly Name | System Status | Source Level | When does it enter this state? | Final Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **진행 중** | `ISSUED` | Reference Evidence | Issue request is in the 4-stage pipeline before credential completion. | Advances to `ISSUED` or `FAILED`. |
| **사용자 승인 대기** | `ISSUED` | Reference Evidence | Pipeline requires user confirmation or signed action. | User approval allows progress. |
| **생성 완료** | `CREATED` | Reference Evidence | CredentialCreate completed and CredentialAccept has not completed yet. | Credential remains pending acceptance. |
| **수락 완료 / 유효** | `ACCEPTED` | Reference Evidence | CredentialCreate and CredentialAccept both completed. | Credential can be submitted before expiration/revocation. |
| **기관 제출됨** | `SUBMITTED` | Reference Evidence | Credential is submitted to one institution request. | Submission row tracks result; credential remains user-held. |
| **기관 수령** | `RECEIVED` | Reference Evidence | Institution submission was received. | May move to verifying/rejected or remain accepted by policy. |
| **검증 중** | `VERIFYING` | Reference Evidence | Institution is verifying submitted credential. | Later accepted/rejected if implemented. |
| **반려** | `REJECTED` | Reference Evidence | Institution rejects the submission. | User/operator may convert to dispute. |
| **만료됨** | `EXPIRED` | Reference Evidence | Credential validity period ended. | Submission blocked; cleanup/revocation may follow. |
| **폐기됨** | `FAILED` | Reference Evidence | Credential is invalidated by operator/dispute/system lifecycle. | Submission blocked and audit retained. |
| **실패** | `FAILED` | Reference Evidence | Issuance or credential creation failed. | Retry/reissue policy required. |

## 3. External & Industry Bridge

| Industry/External Term | Our Internal Name | Source Level | Mapping Role |
| :--- | :--- | :--- | :--- |
| **XLS-70 Credential** | `XrplCredential` | Reference Evidence | External XRPL credential standard reference. MVP may publish to XRP Testnet for hackathon evidence, but production/mainnet integration remains out of scope until explicit approval. |
| **Web3Auth ID Token** | `ExternalIdentityToken` | ADR Evidence | Used only at login/registration to obtain Internal JWT. Credential APIs should use Internal JWT, not raw Web3Auth token. |
| **Internal JWT** | `InternalJwtBearer` | ADR Evidence | Stateless application session token for protected Credential APIs. |
| **CI / identity verification event** | `AuthEvent` | Reference Evidence | Heavy-action verification evidence linked by id; Auth owns verification policy/log storage. |

## 4. Hallucination Guards

- **Do not implement from this draft until approved**: This spec is still a draft update.
- **Do not use external wireframe URL as source of truth when local reference exists**: Use `.ai-agent-context/references/frontend-design/Readme.md` first.
- **Do not design new Credential APIs around `X-User-Id`**: ADR-002 makes Internal JWT the protected API strategy. `X-User-Id` may remain legacy/test fallback only if existing code requires it.
- **Do not collapse the 4-stage operations pipeline into the old 4-handover model**: the latest reference uses 4 stages; any 4-signature rule must be explicitly related to pipeline stages or deferred.
- **Do not treat institution submission as one row per credential**: latest reference states row unit is one submission; one credential can create N submission rows.
- **Do not silently submit credentials**: institution submission is a heavy action and must be user-confirmed/auth-gated.
- **Do not let Credential own AuthLog or Dispute internals**: link by ids/events and use approved cross-domain boundaries.
