# Dispute Domain Events

## 1. DisputeCreatedEvent
- **Publisher**: `DisputeModule`
- **Subscriber(s)**: `NotificationService`, `AuditModule`
- **Trigger Condition**: When a user successfully files a new dispute.

### Event Payload (Core Data)
| Field | Description | Importance |
| :--- | :--- | :--- |
| `disputeId` | Unique identifier of the dispute | Primary Key |
| `requestId` | Original request link | Informational |
| `requesterId` | Member who filed | Informational |
| `timestamp` | Time of creation | Audit |

## 2. RevokeOnChainEvent
- **Publisher**: `DisputeModule`
- **Subscriber(s)**: `BlockchainModule` (Infrastructure)
- **Trigger Condition**: When a dispute is resolved with `Revoke` or `Reissue` action selected.

### Event Payload (Core Data)
| Field | Description | Importance |
| :--- | :--- | :--- |
| `disputeId` | Link to resolution context | Audit |
| `credentialId` | On-chain ID to delete | Primary Key |
| `issuerAddress` | System issuer address | Authority |

## 3. CreateNewRequestForReissueEvent (Option B)
- **Publisher**: `DisputeModule`
- **Subscriber(s)**: `IssuanceModule`, `TranslationModule`
- **Trigger Condition**: When a dispute is resolved with the `Reissue` action.

### Event Payload (Core Data)
| Field | Description | Importance |
| :--- | :--- | :--- |
| `disputeId` | Source dispute ID | Audit |
| `originalRequestId` | Request ID to copy metadata and files from | Primary Key |
| `priority` | `HIGH` | Operational |
| `reissueReason` | Reason captured in the dispute | Informational |
