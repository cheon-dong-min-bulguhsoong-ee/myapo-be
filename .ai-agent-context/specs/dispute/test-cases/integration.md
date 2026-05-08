# Dispute Integration Test Cases

## 1. Database & Persistence Flows
Verify that domain entities are correctly mapped and persisted in the database.

### Scenario: Save Dispute with Timeline
- **Step 1**: Create a new Dispute entity via `DisputeRepository`.
- **Step 2**: Add a timeline entry.
- **Step 3**: Retrieve by ID.
- **Expectation**: Timeline list is loaded and matches the saved entry.

## 2. Cross-Module Communication
Verify interactions between Dispute and other modules.

### Scenario: Trigger Revocation on Resolve
- **Action**: Resolve a dispute with `executeRevoke: true`.
- **Verification**: Check if `RevokeOnChainEvent` is published to the event bus.
- **Expectation**: The event payload contains the correct `credentialId`.
