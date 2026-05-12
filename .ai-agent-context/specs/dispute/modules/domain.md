# Dispute Domain Models

## 1. Entity / Aggregate: Dispute
- **Core Purpose**: Represents a formal grievance filed by a user and its lifecycle management until resolution.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Unique identifier (DSP-YYYY-NNNN) | System Generated |
| `status` | Current lifecycle state | Finite State Machine (Enum) |
| `type` | Nature of grievance (e.g., TYPO) | Determines initial SLA |
| `targetStage` | The specific stage being disputed | Enum (e.g., `MYDATA_RECEIVED`) |
| `requestId` | Link to the original issuance | Immutable once created |
| `requesterId` | Member ID who filed the dispute | Immutable |
| `operatorId` | Assigned staff member | Nullable (until assigned) |
| `timeline` | Chronological list of events | Audit Log (List) |
| `slaDeadline` | Expected resolution timestamp | Updated on pause/resume |
| `isSlaPaused` | SLA countdown flag | True if state is `INFO_REQUESTED` |

### Business Invariants (Rules)
- **Eligibility**: 
    - A dispute can be created for any stage that is in `DONE` status.
    - A dispute can be created for a `COMPLETED` (ISSUED) request.
    - **MUST NOT**: Allow disputes on stages that are `ACTIVE` or `PENDING` (files not ready for review).
- **Process Impact**: Opening a dispute **MUST** automatically pause the progress of the linked `Issuance Request`.
- **Workflow**: Status must progress through `RECEIVED` -> `ASSIGNED` -> `IN_REVIEW` before resolution.
- **Assignment**: Only an admin can assign or reassign an operator.
- **Privacy**: Internal timeline entries must not be visible to the requester.
- **Finality**: A `RESOLVED` or `REJECTED` dispute cannot be modified except for `REOPEN` by an admin.
- **Resumption**: The `Issuance Request` can only resume after the dispute is `RESOLVED` (with corrections) or `REJECTED`.
