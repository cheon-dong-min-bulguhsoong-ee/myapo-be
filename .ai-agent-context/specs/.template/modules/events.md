# [Domain Name] Domain Events

## 1. [EventName] (e.g., OrderPlacedEvent)
- **Publisher**: (e.g., `OrderModule`, `PaymentService`)
- **Subscriber(s)**: (e.g., `InventoryModule`, `NotificationService`)
- **Trigger Condition**: (e.g., When a payment is successfully confirmed.)

### Event Payload (Core Data)
| Field | Description | Importance |
| :--- | :--- | :--- |
| `orderId` | The ID of the placed order | Primary Key |
| `amount` | Total amount of the order | Informational |
| `timestamp` | Time the event was generated | Audit |
