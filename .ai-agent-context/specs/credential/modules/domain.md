# Credential Domain Models

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Source Boundary**: Names below are proposed backend model names aligned to latest frontend-design and ADR-002.

## 1. Aggregate: Credential
- **Core Purpose**: Represents the user-held credential result after the issue pipeline reaches completion.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal credential id. | System generated. |
| `userId` | Owner user id extracted from Internal JWT context. | Required. |
| `walletId` | Related UserWallet id. | Required when issued. |
| `walletAddress` | Displayable wallet address. | Derived from UserWallet. |
| `issueRequestId` | Issue request that produced this credential. | Required. |
| `documentCode` | Related `documents.document_code` if available. | Cross-domain reference only. |
| `documentTypeId` | Source document type. | Required. |
| `issuerId` | Issuer/institution id. | Required after issuer resolution. |
| `status` | Credential lifecycle status. | `CREATED`, `ACCEPTED`, `EXPIRED`, `REVOKED`, `FAILED`. |
| `issuedAt` | Issue completion timestamp. | Required when issued. |
| `expiresAt` | Validity end timestamp. | Required when issued. |
| `revokedAt` | Revocation timestamp. | Nullable. |
| `revocationReason` | Reason for revocation. | Required when revoked. |
| `xrplCredentialId` | Testnet XRPL credential object identity or derived reference. | Nullable. |
| `xrplTransactionHash` | Latest related XRP Testnet transaction hash for MVP evidence. | Nullable; not production/mainnet finality. |
| `currentStage` | Snapshot of `credential_issue_requests.current_stage`. | No raw file body. |
| `createdAt` | Creation timestamp. | Audit. |
| `updatedAt` | Update timestamp. | Audit. |

### Business Invariants
- A credential has exactly one owner.
- A credential cannot be submitted if status is not `ACCEPTED`, or if it is `EXPIRED`, `REVOKED`, or `FAILED`.
- A credential cannot be submitted when `expiresAt <= now`, even if stored status has not been projected to `EXPIRED`.
- XRP Testnet credentials must expose Testnet metadata and must not claim production/mainnet XRPL finality.

## 2. Aggregate: CredentialIssueRequest
- **Core Purpose**: Tracks issue progress through the latest 4-stage operations pipeline.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal issue request id. | System generated. |
| `userId` | Request owner. | Required. |
| `documentCode` | Existing `documents.document_code` if issue is document-backed. | Optional until integration finalized. |
| `documentTypeId` | Requested document type. | Required. |
| `issuerId` | Issuing authority. | Required after validation. |
| `status` | Request lifecycle status. | `ISSUED`, `FAILED`. |
| `currentStage` | Current 4-stage pipeline stage. | `AUTHORITY_DOC_ISSUED`, `TRANSLATOR_DOC_RECEIVED`, `TRANSLATOR_DOC_NOTARIZED`, `APOSTILLE_DOC_ISSUED`. |
| `failureReason` | Machine-readable failure reason. | Required when failed. |
| `createdAt` | Request creation timestamp. | Audit. |
| `completedAt` | Completion timestamp. | Nullable. |

### Business Invariants
- Pipeline stage order must be deterministic.
- `ISSUED` request status requires a created credential or approved deferred creation policy.
  - Credential issue request does not own CI verification data.
- The old four-signature model is not a hard invariant unless an approved ADR/spec maps it to this pipeline.

## 3. Entity: IssuePipelineStageSnapshot
- **Core Purpose**: Provides a stable projection for console/mobile pipeline display.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `issueRequestId` | Parent request. | Required. |
| `stage` | Pipeline stage enum. | Required. |
| `label` | Display label. | Korean label from reference. |
| `status` | Stage state. | `PENDING`, `ACTIVE`, `DONE`, `FAILED`. |
| `updatedAt` | Projection timestamp. | Audit. |

### Business Invariants
- One active stage at most for a non-terminal request.
- Valid/expired/revoked credentials display all issue stages as done unless failure audit says otherwise.

## 4. Entity: CredentialSubmission
- **Core Purpose**: Records one credential submission to one institution request. Row unit is submission.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Submission id. | System generated. |
| `credentialId` | Submitted credential. | Required. |
| `userId` | Credential owner at submission time. | Required. |
| `submissionRequestId` | Institution request id. | Required. |
| `recipientInstitutionId` | Receiving institution. | Required. |
| `status` | Institution submission result. | `RECEIVED`, `VERIFYING`, `REJECTED`. |
| `rejectionReason` | Reason when rejected. | Required when rejected if provided by institution. |
| `submittedAt` | Submission timestamp. | Required. |
| `updatedAt` | Update timestamp. | Audit. |

### Business Invariants
- Submission requires an issued, non-expired, non-revoked credential.
- Submission requires a valid institution request.
- Duplicate submission for the same credential and submission request must be rejected or idempotent by explicit policy.
- Rejected submissions can provide context for Dispute conversion, but do not become Dispute entities.

## 5. Entity: CredentialRevocationRecord
- **Core Purpose**: Audits credential invalidation by expiration cleanup, dispute/operator action, or system lifecycle.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Revocation record id. | System generated. |
| `credentialId` | Target credential. | Required. |
| `reason` | Revocation reason. | Required. |
| `actorType` | `SYSTEM`, `USER`, `OPERATOR`, `DISPUTE`. | Required. |
| `actorId` | Actor id if available. | Optional. |
| `credentialDeleteRef` | Mock/testnet CredentialDelete reference. | Optional. |
| `createdAt` | Record timestamp. | Audit. |

### Business Invariants
- Revocation blocks future submissions.
- Expiration status and forced revocation should remain distinguishable in audit records.
