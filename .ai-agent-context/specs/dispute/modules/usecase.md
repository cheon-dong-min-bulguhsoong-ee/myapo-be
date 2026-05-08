# Dispute Use Cases

## 1. FileDispute (User)
- **Actor**: Requester (User)
- **Trigger**: Submitting the dispute form in the mobile app.

### Service Flow
1.  **Validation**: Verify that the `requestId` belongs to the user and is `COMPLETED`.
2.  **Domain Logic**: Create a `Dispute` aggregate with initial `RECEIVED` status.
3.  **Persistence**: Save the dispute and its associated evidence metadata.
4.  **Side Effects**: Fire `DisputeCreatedEvent`.

### Input / Output
- **Inputs**: `requestId`, `type`, `headline`, `reason`, `evidenceFiles`
- **Outputs**: `disputeId`, `initialStatus`

## 2. AssignOperator (Admin)
- **Actor**: Administrator
- **Trigger**: Manual assignment action in the console.

### Service Flow
1.  **Workload Check**: Calculate the number of active cases for each operator.
2.  **Validation**: Verify the dispute is in `RECEIVED` status.
3.  **Domain Logic**: Update `operatorId` and change status to `ASSIGNED`.
4.  **Persistence**: Update the dispute and record `ASSIGNED` in the timeline.
5.  **Side Effects**: Fire `DisputeAssignedEvent`.

## 3. ResolveDispute (Operator)
- **Actor**: Assigned Operator
- **Trigger**: Finalizing review in the console.

### Service Flow
1.  **Validation**: Ensure the operator is the assigned one and status is `IN_REVIEW` or `PROCESSING`.
2.  **Pre-condition (Reissue)**: If `executeReissue` is true, the existing Credential MUST be revoked first.
3.  **Domain Logic**: 
    - Set status to `RESOLVED` or `REJECTED`.
    - If `executeRevoke` or `executeReissue` is true, trigger `RevokeOnChainEvent`.
    - If `executeReissue` is true, trigger `CreateNewRequestForReissueEvent` (Option B).
4.  **Persistence**: Save resolution details and update the dispute.
5.  **Side Effects**: 
    - Fire `DisputeResolvedEvent` or `DisputeRejectedEvent`.
    - Notification sent to User.

### Side Effects
- **Events Fired**: `DisputeResolvedEvent`, `RevokeOnChainEvent`, `CreateNewRequestForReissueEvent`
- **Notifications**: Push notification sent to User.
