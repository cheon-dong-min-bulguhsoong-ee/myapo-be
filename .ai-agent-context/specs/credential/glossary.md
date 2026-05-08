# Credential Glossary

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 5-stage pipeline, Internal JWT, user-facing APIs, nullable authEventId references, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
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
| **Credential** | `Credential` | Reference Evidence | Reusable credential/document result shown in the console and user app. It can be valid, submitted, expired, revoked, or failed. | `크리덴셜 ID`, valid document tab row. |
| **XRPL Credential Testnet Evidence** | `XrplCredentialTestnetEvidence` | Hackathon Decision | XRP Testnet XLS-70 transaction evidence used for hackathon review. It may include transaction hash, ledger index, validation result, and on-ledger Credential object snapshot. It must not claim production/mainnet finality. | Testnet `CredentialCreate` / `CredentialAccept` / `CredentialDelete` tx log. |
| **XRPL Credential Mock** | `XrplCredentialMock` | Reference Evidence | Local fallback credential representation when Testnet publishing is unavailable. Production/mainnet XRPL finality is not claimed by the current reference. | `Testnet / Mock` badge. |
| **발급 요청** | `CredentialIssueRequest` | Reference Evidence | A request that moves through the document/credential issuance pipeline until a credential exists or fails. | `REQ-...` in document management and request detail. |
| **5단계 발급 파이프라인** | `IssuePipelineStage` | Reference Evidence | Operations pipeline used by latest console: 접수, 사전 검토, 번역/검수, 공증 서명, 발급 완료. | Document management accordion and request detail pipeline. |
| **크리덴셜 생성** | `CredentialCreationSubstep` | Reference Evidence | A progress substep shown inside the 5-stage pipeline when credential creation is the current work. | `substep(크리덴셜 생성 / 사용자 승인)`. |
| **사용자 승인 / 서명** | `UserApproval` / `UserSignature` | Reference Evidence | User confirmation required for heavy actions and credential-related progress. Exact signature count remains a product decision. | `사용자 승인`, previous wireframe `사용자 서명`. |
| **사용자 지갑** | `UserWallet` | Reference Evidence | Destination/account associated with issued credential metadata. | Request detail `지갑 주소`. |
| **유효한 문서** | `ISSUED` | Reference Evidence | Credential is issued and can be used before expiration/revocation. | Document management `valid` tab. |
| **기관 제출** | `CredentialSubmission` | Reference Evidence | One submission event for a credential to an institution. Row unit is submission, not credential. | `SUB-...`; one credential submitted to N institutions creates N rows. |
| **기관 제출 결과** | `CredentialSubmissionStatus` | Reference Evidence | Institution submission result state: received, verifying, or rejected. | `received`, `verifying`, `rejected` badges. |
| **제출 시 인증 ID** | `authEventId` | Reference Evidence | Authentication log event linked to an institution submission. | Submission accordion -> auth log jump. |
| **인증 로그** | `AuthLog` | Reference Evidence | Operations log for heavy action identity verification. Credential uses it through auth event references, but Auth owns the log. | Auth page table with linked object id. |
| **트리거 3종** | `AuthTriggerType` | Reference Evidence | Auth gates are limited to issue request, institution submit, dispute report. | `issue_request`, `institution_submit`, `dispute_report`. |
| **CI 불일치 차단** | `CiMismatchBlocked` | Reference Evidence | Auth failure category where reauthentication CI differs from the user account CI. | Auth log failure filter. |
| **만료된 문서** | `EXPIRED` | Reference Evidence | Credential validity period has ended. Submission must be blocked. | Document management `expired` tab. |
| **폐기된 문서** | `REVOKED` | Reference Evidence | Credential has been invalidated by expiration cleanup, dispute/operator action, or lifecycle policy. | Document management `revoked` tab; dispute action `크리덴셜 폐기`. |
| **분쟁 전환** | `DisputeConversion` | Reference Evidence | Rejected institution submission can start a dispute with prefilled rejection context. Dispute owns the case. | Submitted row accordion `분쟁 신고로 전환`. |
| **Internal JWT** | `InternalJwtBearer` | ADR Evidence | Server-issued stateless JWT used for protected APIs after Web3Auth login. | `Authorization: Bearer <accessToken>`. |
| **X-User-Id** | `LegacyUserIdHeader` | Spec Inference | Legacy/test-only fallback seen in older code; not the preferred contract for new Credential APIs after ADR-002. | `X-User-Id` temporary header. |

## 2. Status & Lifecycle

| Friendly Name | System Status | Source Level | When does it enter this state? | Final Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **진행 중** | `ISSUING` | Reference Evidence | Issue request is in the 5-stage pipeline before credential completion. | Advances to `ISSUED` or `FAILED`. |
| **사용자 승인 대기** | `USER_APPROVAL_REQUIRED` | Reference Evidence | Pipeline/substep requires user confirmation or auth-gated action. | User approval/auth event allows progress. |
| **발급 완료 / 유효** | `ISSUED` | Reference Evidence | Pipeline reaches 발급 완료 and credential is created. | Credential can be submitted before expiration/revocation. |
| **기관 제출됨** | `SUBMITTED` | Reference Evidence | Credential is submitted to one institution request. | Submission row tracks result; credential may remain reusable. |
| **기관 수령** | `RECEIVED` | Reference Evidence | Institution submission was received. | May move to verifying/rejected or remain accepted by policy. |
| **검증 중** | `VERIFYING` | Reference Evidence | Institution is verifying submitted credential. | Later accepted/rejected if implemented. |
| **반려** | `REJECTED` | Reference Evidence | Institution rejects the submission. | User/operator may convert to dispute. |
| **만료됨** | `EXPIRED` | Reference Evidence | Credential validity period ended. | Submission blocked; cleanup/revocation may follow. |
| **폐기됨** | `REVOKED` | Reference Evidence | Credential is invalidated by operator/dispute/system lifecycle. | Submission blocked and audit retained. |
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
- **Do not collapse the 5-stage operations pipeline into the old 4-handover model**: the latest reference uses 5 stages; any 4-signature rule must be explicitly related to pipeline substeps or deferred.
- **Do not treat institution submission as one row per credential**: latest reference states row unit is one submission; one credential can create N submission rows.
- **Do not silently submit credentials**: institution submission is a heavy action and must be user-confirmed/auth-gated.
- **Do not let Credential own AuthLog or Dispute internals**: link by ids/events and use approved cross-domain boundaries.
