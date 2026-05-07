# Credential Domain Events

## 0. Draft Status
- **Status**: Draft from wireframe evidence. User approval is required before implementation.
- **Event Infrastructure Caveat**: The current backend may not have an event bus. These events define business events and can be implemented as synchronous service calls, outbox records, or actual events after architecture approval.

## 1. CredentialIssueRequestCreated
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Notification, Operations Console, Document domain integration if approved
- **Trigger Condition**: User starts credential issuance.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `issueRequestId` | Created issue request id. | Primary Key |
| `userId` | Request owner. | Required |
| `documentTypeId` | Requested document type. | Required |
| `issuerId` | Resolved issuer. | Required if resolved |
| `requiredSignatureCount` | Required signatures. | Required |
| `timestamp` | Event time. | Audit |

## 2. CredentialHandoverSignatureRequired
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Notification, Mobile app projection
- **Trigger Condition**: A handover step enters `SIGNATURE_REQUIRED`.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `issueRequestId` | Request id. | Required |
| `userId` | User who must sign. | Required |
| `handoverStep` | Step number. | Required |
| `label` | Step label. | Informational |
| `timestamp` | Event time. | Audit |

## 3. CredentialHandoverSigned
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Operations Console, Dispute trace projection
- **Trigger Condition**: User signature is recorded for a handover.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `issueRequestId` | Request id. | Required |
| `userId` | Signer. | Required |
| `handoverStep` | Signed step number. | Required |
| `signatureHash` | Signature hash/reference. | Audit |
| `signedAt` | Signature time. | Audit |

## 4. CredentialIssued
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Notification, Wallet projection, Operations Console
- **Trigger Condition**: All handover signatures are complete and final credential is created.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Issued credential id. | Primary Key |
| `issueRequestId` | Source request. | Required |
| `userId` | Owner. | Required |
| `walletAddress` | Destination wallet address. | Required |
| `expiresAt` | Validity end. | Required |
| `isMock` | Indicates mock/testnet flow. | Required for MVP |

## 5. CredentialSubmitted
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Institution UI, Operations Console
- **Trigger Condition**: User submits a credential to an institution request.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `submissionId` | Submission id. | Primary Key |
| `credentialId` | Submitted credential. | Required |
| `userId` | Owner. | Required |
| `recipientInstitutionId` | Receiving institution. | Required |
| `submittedAt` | Submission timestamp. | Audit |

## 6. CredentialExpired
- **Publisher**: `CredentialService` or scheduler
- **Subscriber(s)**: Storage cleanup, Key destruction, Operations Console
- **Trigger Condition**: Credential expiration is detected.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Expired credential. | Required |
| `userId` | Owner. | Required |
| `expiresAt` | Expiration timestamp. | Required |
| `cleanupRequired` | Whether source deletion/key destruction should run. | Required |
| `timestamp` | Event time. | Audit |

## 7. CredentialRevoked
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Submission blocking projection, Notification, Dispute/Operations Console
- **Trigger Condition**: Credential is manually or automatically revoked/deleted.

### Event Payload
| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Revoked credential. | Required |
| `reason` | Revocation reason. | Required |
| `actorType` | System/user/operator/dispute. | Required |
| `actorId` | Actor id if available. | Optional |
| `revokedAt` | Revocation timestamp. | Audit |
