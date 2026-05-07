# [Domain Name] Use Cases

## 1. [UseCaseName] (e.g., RequestEscrowRelease)
- **Actor**: (e.g., Buyer, System Cron)
- **Trigger**: (e.g., Manual button click, Timeout event)

### Service Flow
1.  **Validation**: Check if the actor has permission and if the entity is in the correct state.
2.  **Domain Logic**: Invoke domain methods (e.g., `escrow.release()`).
3.  **Persistence**: Save the updated state to the database.
4.  **Side Effects**: Dispatch events or notify external systems.

### Input / Output
- **Inputs**: (e.g., Transaction ID, Release Reason)
- **Outputs**: (e.g., Updated Transaction Status, Receipt ID)

### Side Effects
- **Events Fired**: `EscrowReleasedEvent`
- **Notifications**: Email sent to Seller.
