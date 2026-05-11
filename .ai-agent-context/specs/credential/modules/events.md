# Credential Domain Events

## 0. Draft Status
- **Status**: Approved for MVP 1st implementation. Scope: 4-stage pipeline, Internal JWT, user-facing APIs, and XRP Testnet XLS-70 adapter evidence for hackathon transaction-log review. Excluded: operator APIs, production/mainnet XRPL finality, Dispute creation, Institution request creation, scheduler, and fixed 4-signature handover.
- **Event Infrastructure Caveat**: Events are business-event definitions. They can be implemented as outbox rows, synchronous service calls, or actual events after architecture approval.

## 1. CredentialIssueRequestCreated
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Operations projection, Notification, Auth-log correlation if approved
- **Trigger Condition**: Authenticated user starts issue request.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `issueRequestId` | Created issue request id. | Primary Key |
| `userId` | Request owner. | Required |
| `documentTypeId` | Requested document type. | Required |
| `currentStage` | Initial 4-stage pipeline stage. | Required |
| `timestamp` | Event time. | Audit |

## 2. IssuePipelineAdvanced
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Console projection, Notification
- **Trigger Condition**: Issue request moves stage.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `issueRequestId` | Request id. | Required |
| `fromStage` | Previous stage. | Audit |
| `toStage` | New stage. | Required |
| `timestamp` | Event time. | Audit |

## 3. CredentialCreated
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Wallet projection, Operations Console, Notification
- **Trigger Condition**: Issue pipeline completes and credential row is created.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Issued credential id. | Primary Key |
| `issueRequestId` | Source request. | Required |
| `userId` | Owner. | Required |
| `xrplSubjectAddress` | Subject wallet address used for XRPL evidence. | Required |
| `expiresAt` | Validity end. | Required |

## 4. CredentialSubmitted
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Institution UI, Operations Console, Auth-log correlation
- **Trigger Condition**: User submits a credential to an institution request.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `submissionId` | Submission row id. | Primary Key |
| `credentialId` | Submitted credential. | Required |
| `userId` | Owner. | Required |
| `recipientInstitutionId` | Receiving institution. | Required |
| `submittedAt` | Submission timestamp. | Audit |

## 5. CredentialSubmissionResultChanged
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Operations Console, Dispute context projection
- **Trigger Condition**: Institution submission status changes.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `submissionId` | Submission id. | Primary Key |
| `credentialId` | Credential id. | Required |
| `status` | `RECEIVED`, `VERIFYING`, or `REJECTED`. | Required |
| `rejectionReason` | Rejection reason if rejected. | Required when rejected if known |
| `timestamp` | Event time. | Audit |

## 6. CredentialExpired
- **Publisher**: `CredentialService` or scheduler
- **Subscriber(s)**: Submission blocker, cleanup, Operations Console
- **Trigger Condition**: Credential expiration is detected.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Expired credential. | Required |
| `userId` | Owner. | Required |
| `expiresAt` | Expiration timestamp. | Required |
| `timestamp` | Event time. | Audit |

## 7. CredentialRevoked
- **Publisher**: `CredentialService`
- **Subscriber(s)**: Submission blocker, Notification, Dispute/Operations Console
- **Trigger Condition**: Credential is manually or automatically revoked.

| Field | Description | Importance |
| :--- | :--- | :--- |
| `credentialId` | Revoked credential. | Required |
| `reason` | Revocation reason. | Required |
| `actorType` | System/user/operator/dispute. | Required |
| `actorId` | Actor id if available. | Optional |
| `revokedAt` | Revocation timestamp. | Audit |
