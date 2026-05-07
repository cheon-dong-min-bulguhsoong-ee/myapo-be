# Credential Domain Models

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Source Boundary**: Entity names and properties below are proposed backend model names derived from wireframe behavior.

## 1. Aggregate: Credential
- **Core Purpose**: Represents the reusable verified credential delivered to a user's wallet after document issuance, handovers, and required user signatures.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal credential id. | System generated. |
| `userId` | Owner user id. | Must match the wallet owner. |
| `walletId` | User wallet id or wallet relation. | Required for wallet delivery. |
| `walletAddress` | Public wallet address shown in console/detail. | Derived from UserWallet. |
| `issueRequestId` | Request that produced the credential. | Required for audit. |
| `documentId` | Related Document domain id, if available. | Cross-domain reference only. |
| `documentTypeId` | Source document type. | Required. |
| `issuerId` | Source issuer/institution. | Required after issuer selection. |
| `status` | Current credential status. | `ISSUED`, `EXPIRED`, `REVOKED`, `FAILED`. |
| `issuedAt` | Completion timestamp. | Required when issued. |
| `expiresAt` | Validity end timestamp. | Required when issued. |
| `revokedAt` | Revocation/deletion timestamp. | Required when revoked. |
| `revocationReason` | Reason for revocation. | Required for operator/dispute revocation. |
| `xrplCredentialId` | Mock/testnet XRPL credential id. | Nullable until created. |
| `xrplTransactionHash` | Mock/testnet transaction hash. | Nullable; must not imply production finality in MVP. |
| `isMock` | Whether this is mock/testnet metadata. | Must be true for MVP wireframe flow. |
| `sourceDocumentRef` | Reference to encrypted source document snapshot. | No raw file contents. |
| `createdAt` | Creation timestamp. | Audit. |
| `updatedAt` | Update timestamp. | Audit. |

### Business Invariants
- A credential must have exactly one owner user.
- A credential must not be submitted when `status` is `EXPIRED`, `REVOKED`, or `FAILED`.
- A credential must not be treated as valid when `expiresAt` is earlier than the current time, even if stored status has not been updated yet.
- A credential issued under MVP mock mode must expose `isMock = true` or equivalent metadata.
- A credential must preserve enough metadata to trace the issuance request and handover chain.

## 2. Aggregate: CredentialIssueRequest
- **Core Purpose**: Tracks the issuance process before the final credential is created.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal issue request id. | System generated. |
| `userId` | Request owner. | Required. |
| `documentId` | Existing document id, if issuance is based on Document domain. | Optional until Document integration is finalized. |
| `documentTypeId` | Requested document type. | Required. |
| `issuerId` | Issuing authority. | Required after validation. |
| `status` | Request lifecycle status. | `ISSUING`, `SIGNATURE_REQUIRED`, `ISSUED`, `FAILED`, `REVOKED`. |
| `requiredSignatureCount` | Required user signature count. | Draft default: 4. |
| `completedSignatureCount` | Number of recorded signatures. | Must be `0..requiredSignatureCount`. |
| `currentHandoverStep` | Current step waiting for action. | Nullable when complete/failed. |
| `failureReason` | Machine-readable failure reason. | Required when failed. |
| `createdAt` | Request creation timestamp. | Audit. |
| `completedAt` | Completion timestamp. | Nullable. |

### Business Invariants
- `completedSignatureCount` cannot exceed `requiredSignatureCount`.
- A request cannot complete until all required handover signatures are recorded.
- Only the owner user can sign a user-facing handover.
- A completed request must create at most one active final credential unless reissue creates a separate request.
- Duplicate active issue requests for the same user/document type should be blocked or explicitly allowed by product policy before implementation.

## 3. Entity: CredentialHandover
- **Core Purpose**: Represents one handover step in the trust chain.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Handover id. | System generated. |
| `issueRequestId` | Parent issuance request. | Required. |
| `step` | Step number. | Draft range: 1 to 4. |
| `label` | Human-readable step label. | Example: `발급 원본`, `처리위임`, `인증의뢰`, `최종 Credential`. |
| `actorType` | Actor responsible for the step. | Issuer, processing institution, apostille authority, system, etc. |
| `actorId` | Optional actor id. | Cross-domain reference. |
| `status` | Handover state. | `PENDING`, `SIGNATURE_REQUIRED`, `SIGNED`, `COMPLETED`, `FAILED`. |
| `signatureHash` | Hash/reference of user signature. | Store hash/reference, not private key. |
| `signedAt` | Signature timestamp. | Required when signed. |
| `documentSnapshotRef` | Document snapshot reference for this step. | Optional. |

### Business Invariants
- Each `(issueRequestId, step)` pair must be unique.
- A handover can be signed only when it is the current signable step.
- Signature data must be immutable after it is recorded, except through an explicit dispute/reissue process.

## 4. Entity: CredentialSubmission
- **Core Purpose**: Records submission of a credential to an institution request.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Submission id. | System generated. |
| `credentialId` | Submitted credential. | Required. |
| `userId` | Credential owner. | Required for access checks. |
| `submissionRequestId` | Institution request id. | Required. |
| `recipientInstitutionId` | Receiving institution. | Required. |
| `status` | Submission state. | `SUBMITTED`, `ACCEPTED`, `REJECTED`, `DISPUTED`. |
| `submittedAt` | Submission timestamp. | Required. |
| `resultReason` | Rejection/dispute reason if any. | Optional. |

### Business Invariants
- Submission requires a prior institution submission request.
- Submission requires `credential.status = ISSUED` and `expiresAt > now`.
- Duplicate submission for the same credential and institution request should be idempotent or rejected consistently.

## 5. Entity: CredentialRevocationRecord
- **Core Purpose**: Audits credential invalidation by expiration, operator action, or dispute resolution.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Revocation record id. | System generated. |
| `credentialId` | Target credential. | Required. |
| `reason` | Revocation reason. | Required. |
| `actorType` | `SYSTEM`, `USER`, `OPERATOR`, `DISPUTE`. | Required. |
| `actorId` | Actor id if available. | Optional. |
| `credentialDeleteRef` | Mock/testnet CredentialDelete reference. | Optional. |
| `sourceDeletionRequestedAt` | Time source deletion was requested. | Optional. |
| `keyDestructionRequestedAt` | Time key destruction was requested. | Optional. |
| `createdAt` | Record timestamp. | Audit. |

### Business Invariants
- Revocation must make future credential submissions impossible.
- Revocation should be idempotent for the same credential and reason.
- Expiration can trigger revocation/deletion asynchronously, but submission validity must be blocked synchronously by `expiresAt`.
