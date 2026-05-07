# Credential Glossary

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before code implementation.
- **Primary Sources**:
  - `https://github.com/cheon-dong-min-bulguhsoong-ee/IDEATION-scaffold/tree/main/frontend/wireframe/v4`
  - `frontend/wireframe/v4/index.html`
  - `frontend/wireframe/v4/app-korean.html`
  - `frontend/wireframe/v4/app-foreigner.html`
  - `frontend/wireframe/v4/console.html`
  - `frontend/wireframe/v4/console/request-detail.html`
  - `frontend/wireframe/v4/console/dispute-detail.html`
  - `frontend/wireframe/v4/console/member-detail.html`
- **Evidence Boundary**: Terms marked as `Wireframe Evidence` are visible in the wireframe. Terms marked as `Spec Inference` are proposed backend names derived from the wireframe and must be confirmed.

## 1. Primary Business Concepts

| Business Term | System Key (Code) | Source Level | Shared Definition | Concrete Example |
| :--- | :--- | :--- | :--- | :--- |
| **Credential** | `Credential` | Wireframe Evidence | XRPL Credential Mock object representing a user's reusable verified document result. It is valid only until expiration and may be deleted/revoked. | `납세증명서 (영문)` credential in the user's wallet. |
| **XRPL Credential Mock** | `XrplCredentialMock` | Wireframe Evidence | MVP/testnet representation of an XRPL XLS-70 style credential. External institution integration is mock-only for the MVP. | Wireframe badge: `Testnet · Pre-Check Only · XRPL Credential Mock`. |
| **발급 요청** | `CredentialIssueRequest` | Wireframe Evidence | A user-initiated document/credential issuance request that progresses through handover and signature steps. | `REQ-2026-0419`. |
| **인계** | `CredentialHandover` | Wireframe Evidence | A transfer step in the credential lifecycle where the processing responsibility moves to the next actor. Each handover requires user signature before advancing. | `인계 1 · 발급 원본`, `인계 2 · 처리위임`, `인계 3 · 인증의뢰`, `인계 4 · 최종 Credential`. |
| **사용자 서명** | `UserSignature` | Wireframe Evidence | User confirmation with the user's key for a handover step. Missing or mismatched signatures identify a broken trust chain. | `사용자 서명 4 / 4`. |
| **사용자 지갑** | `UserWallet` | Wireframe Evidence | The destination where the final credential arrives after all required handover signatures. | `지갑에 Credential 이 도착했어요`. |
| **유효기간** | `expiresAt` | Wireframe Evidence | Time boundary during which a credential can be reused and submitted. Expired credentials must not be treated as usable. | `유효기간 2026-11-02`. |
| **자동 폐기** | `AutoRevocation` or `AutoDeletion` | Wireframe Evidence | Expiration-triggered destruction/invalidity process for privacy: CredentialDelete, original document deletion, and key destruction. | `CredentialDelete + 원본 삭제 + 키 파기`. |
| **기관 제출 요청** | `InstitutionSubmissionRequest` | Wireframe Evidence | A request initiated by an institution asking the user to submit an eligible credential. User can submit only when an institution request exists. | `기관이 먼저 요청한 경우에만 보내드릴 수 있어요`. |
| **제출 이력** | `CredentialSubmissionHistory` | Wireframe Evidence | Audit trail showing which institutions received a credential. One credential may be submitted to multiple institutions. | `한 크리덴셜이 여러 기관에 제출되면 행이 누적돼요`. |
| **분쟁** | `Dispute` | Wireframe Evidence | A user or institution raised issue about credential/document correctness or processing chain. Credential domain records the related credential state but dispute ownership belongs to Dispute domain. | `오역이 의심된다면 신고할 수 있어요`. |
| **크리덴셜 ID** | `credentialId` | Wireframe Evidence | Public-facing identifier displayed in operations console and detail screens. | `크리덴셜 ID`. |
| **지갑 주소** | `walletAddress` | Wireframe Evidence | User wallet address associated with the credential. | `지갑 주소`. |
| **발급 기관** | `issuerId` | Wireframe Evidence | Institution or authority that issues the source document/credential. | `KR-NTS`, `VN-NTS`, `베트남 정부`, `한국 정부`. |
| **전달 기관** | `recipientInstitutionId` | Wireframe Evidence | Institution that receives a submitted credential. | `KR-BANK`, `US-CONS`, `AU-IMM`, `CA-IMM`. |
| **원본 문서** | `sourceDocumentRef` | Spec Inference | Reference to the encrypted original document or storage object backing the credential. Raw source file handling is not owned by the Credential domain unless explicitly approved. | S3 activity and document download screens. |

## 2. Status & Lifecycle

| Friendly Name | System Status | Source Level | When does it enter this state? | Final Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **미발급** | `NOT_ISSUED` | Wireframe Evidence | The user has no credential for the selected document. | User may start issuance. |
| **발급 진행 중** | `ISSUING` | Wireframe Evidence | A credential issue request exists and one or more handover/signature steps remain. | Advance to `ISSUED` or `FAILED`/`REVOKED`. |
| **서명 대기** | `SIGNATURE_REQUIRED` | Wireframe Evidence | A handover step is ready but the user's signature is missing. | User signs and the process advances. |
| **발급 완료 / 사용 가능** | `ISSUED` | Wireframe Evidence | All required handover signatures are completed and the credential is delivered to the wallet. | Credential can be reused until expiration and submitted to eligible institutions. |
| **기관 제출됨** | `SUBMITTED` | Wireframe Evidence | Credential was sent to an institution submission request. | Submission history is appended. The credential may remain `ISSUED` for reuse. |
| **만료됨** | `EXPIRED` | Wireframe Evidence | Current time is after `expiresAt`. | Credential must not be submitted. Automatic deletion/revocation flow should run. |
| **폐기됨** | `REVOKED` | Wireframe Evidence | Credential was manually or automatically invalidated. | Credential must not be submitted or treated as valid. |
| **실패** | `FAILED` | Wireframe Evidence | Issuer/institution/storage/verification error prevents completion. | User or operator may retry/reissue depending on failure reason. |

## 3. External & Industry Bridge

| Industry/External Term | Our Internal Name | Source Level | Mapping Role |
| :--- | :--- | :--- | :--- |
| **XLS-70 Credential** | `XrplCredential` | Wireframe Evidence | XRPL credential concept used by the product narrative. MVP backend may store only mock metadata until XRPL integration is approved. |
| **CredentialDelete** | `CredentialDeletionRecord` | Wireframe Evidence | Expiration/revocation action that makes the credential unusable and triggers original deletion/key destruction. |
| **DID / VC** | `VerifiableCredentialPayload` | Spec Inference | Future VC payload format. Wireframe does not define an exact W3C VC JSON schema. |
| **Distributed Storage / S3** | `SourceDocumentStorageRef` | Wireframe Evidence | Storage location for encrypted source document artifacts. Credential stores references, not raw file contents, unless later approved. |
| **PIPA Consent and Expiration Deletion** | `PrivacyLifecyclePolicy` | Wireframe Evidence | Compliance narrative: collection/provision consent and deletion upon expiration. Legal accuracy must be confirmed outside this draft before production use. |

## 4. Hallucination Guards

- **Do not implement from this draft until approved**: This file is a wireframe-derived spec draft, not yet an accepted product contract.
- **Do not treat Credential as a permanent reusable document**: Wireframe states reuse is limited to the credential validity period.
- **Do not allow user-initiated arbitrary institution submission**: Wireframe states submission is available only when an institution has requested it first.
- **Do not claim real XRPL integration**: Wireframe repeatedly labels the MVP as `Testnet`, `Pre-Check Only`, and `XRPL Credential Mock`.
- **Do not store raw credential/source document in domain entities**: Store references and metadata unless a storage ADR/spec explicitly authorizes raw payload storage.
- **Do not bypass Document domain**: Credential issuance is related to document issuance and handover, but cross-context calls must use Facade/domain services or ports.
- **Ambiguity Guard**: If the user says `문서`, clarify whether they mean Document domain source document, Credential reusable proof, or Institution submission artifact.
