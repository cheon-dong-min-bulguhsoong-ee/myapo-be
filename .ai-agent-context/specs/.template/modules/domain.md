# [Domain Name] Domain Models

## 1. Entity / Aggregate: [EntityName]
- **Core Purpose**: Brief description of why this entity exists and what it represents.

### Data Elements
| Property | Description | Role / Constraint |
| :--- | :--- | :--- |
| `id` | Unique Identifier | System Generated |
| `status` | Current Lifecycle State | Finite State Machine |

### Business Invariants (Rules)
- **[Rule 1]**: (e.g., An active user must have a verified email.)
- **[Rule 2]**: (e.g., Balance cannot drop below zero.)
