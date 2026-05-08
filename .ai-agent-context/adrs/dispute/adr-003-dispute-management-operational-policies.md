# ADR-003: Dispute Management & Operational Policies

## Status
- accepted

## Context
- **Current State**: The MyApo system requires a formalized process to handle user grievances (Disputes) regarding issued credentials.
- **Problem**: Inconsistencies in handling disputes can lead to operational bottlenecks, lack of accountability, and potential legal risks in the blockchain-based certification process.
- **Constraints**:
    - Must follow Clean Layered Architecture.
    - Must integrate with XRPL XLS-70 (Credentials) for revocation.
    - Must ensure operational efficiency for operators.
- **Considerations**: Privacy of internal operational logic vs. transparency to users; automated vs. manual task distribution.

## Decision
- **Our Choice**: A centralized Dispute Management service with the following key policies:
    1.  **Least Load Assignment with Random Tie-break**: Admin-driven operator assignment based on the number of active cases. Random selection among operators with the same minimum load.
    2.  **Explicit State Transitions**: Status changes (e.g., `IN_REVIEW`, `RESOLVED`) must be triggered by explicit operator actions to ensure accountability.
    3.  **System-driven XRPL Revocation**: The `myapo` backend directly executes `CredentialDelete` transactions as the Issuer to revoke credentials without requiring additional user signatures.
    4.  **Internal Timeline Privacy**: Timeline entries marked as `isInternal` are strictly hidden from the requester (member) but visible to all operators/admins.
    5.  **Dynamic & Pausable SLA**: SLA duration is determined by the `DisputeType`. The SLA countdown pauses in the `INFO_REQUESTED` state and notifies admins upon expiry.

## Rules (LLM Important)
- **MUST**:
    - Verify operator workload before assignment.
    - Record every status change and internal note as a `TimelineEntry`.
    - Check for `RESOLVED` status before triggering XRPL revocation.
    - Hide `isInternal: true` entries when fetching disputes for the requester API.
- **MUST NOT**:
    - Automatically advance dispute status based on 조회 (reading) or file uploads.
    - Expose internal operator identities or notes to the public-facing API.
- **SHOULD**:
    - Use the `Institution` domain codes for identifying the `Source` of the dispute.
    - Trigger `NotifyUser` events on every public status change.

## Impact
- **Advantages**: Improved operational transparency, automated workload balancing, and robust on-chain integrity.
- **Disadvantages**: Manual overhead for admins/operators due to explicit transition requirements.
- **Trade-offs**: Sacrificing user transparency of internal processes to protect operational privacy and security.

## Scope
- **Area of Application**: Dispute Bounded Context.
- **Affected Components**: `DisputeService`, `AssignmentService`, `RevocationService`, `TimelineRepository`.

## Related
- **domain**: Dispute, Member, Request
- **api**: `/api/v1/disputes`
- **other adr**: ADR-001 (User Registration), XLS-70 (XRPL Standards)
