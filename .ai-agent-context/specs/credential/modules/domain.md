# Credential Domain Models

## 0. Draft Status
- **Status**: Draft updated from latest main references. User approval is required before implementation.
- **Source Boundary**: Names below are proposed backend model names aligned to latest frontend-design and ADR-002.

## 1. Aggregate: Credential
- **Core Purpose**: Represents the reusable credential/document result after the issue pipeline reaches completion.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal credential id. | System generated. |
| `userId` | Owner user id extracted from Internal JWT context. | Required. |
| `walletId` | Related UserWallet id. | Required when issued. |
| `walletAddress` | Displayable wallet address. | Derived from UserWallet. |
| `issueRequestId` | Issue request that produced this credential. | Required. |
| `documentId` | Related Document id if available. | Cross-domain reference only. |
| `documentTypeId` | Source document type. | Required. |
| `issuerId` | Issuer/institution id. | Required after issuer resolution. |
| `status` | Credential lifecycle status. | `ISSUED`, `EXPIRED`, `REVOKED`, `FAILED`. |
| `issuedAt` | Issue completion timestamp. | Required when issued. |
| `expiresAt` | Validity end timestamp. | Required when issued. |
| `revokedAt` | Revocation timestamp. | Nullable. |
| `revocationReason` | Reason for revocation. | Required when revoked. |
| `xrplCredentialId` | Mock/testnet XRPL credential id. | Nullable. |
| `xrplTransactionHash` | Mock/testnet transaction hash. | Nullable; not production finality. |
| `isMock` | Whether this is mock/testnet metadata. | Required for MVP. |
| `sourceDocumentRef` | Reference to source/encrypted document artifact. | No raw file body. |
| `createdAt` | Creation timestamp. | Audit. |
| `updatedAt` | Update timestamp. | Audit. |

### Business Invariants
- A credential has exactly one owner.
- A credential cannot be submitted if status is `EXPIRED`, `REVOKED`, or `FAILED`.
- A credential cannot be submitted when `expiresAt <= now`, even if stored status has not been projected to `EXPIRED`.
- Mock/testnet credentials must expose mock metadata and must not claim production XRPL finality.

## 2. Aggregate: CredentialIssueRequest
- **Core Purpose**: Tracks issue progress through the latest 5-stage operations pipeline.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Internal issue request id. | System generated. |
| `userId` | Request owner. | Required. |
| `documentId` | Existing Document id if issue is document-backed. | Optional until integration finalized. |
| `documentTypeId` | Requested document type. | Required. |
| `issuerId` | Issuing authority. | Required after validation. |
| `status` | Request lifecycle status. | `ISSUING`, `USER_APPROVAL_REQUIRED`, `ISSUED`, `FAILED`, `REVOKED`. |
| `currentStage` | Current 5-stage pipeline stage. | `RECEIVED`, `PRE_REVIEW`, `TRANSLATION_REVIEW`, `NOTARY_SIGNATURE`, `ISSUED`. |
| `currentSubstep` | Optional substep label. | Example: `CREDENTIAL_CREATION`, `USER_APPROVAL`. |
| `authEventId` | Auth-owned event for `issue_request` trigger. | Nullable until Auth integration finalized. |
| `failureReason` | Machine-readable failure reason. | Required when failed. |
| `createdAt` | Request creation timestamp. | Audit. |
| `completedAt` | Completion timestamp. | Nullable. |

### Business Invariants
- Pipeline stage order must be deterministic.
- `ISSUED` request status requires a created credential or approved deferred creation policy.
- Credential issue request stores Auth event ids by reference only; it does not own CI verification data.
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
| `substep` | Optional active substep. | Example: credential creation/user approval. |
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
| `authEventId` | Auth-owned event for `institution_submit`. | Nullable until Auth log integration finalized. |
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
