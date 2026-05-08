# Dispute Constraints

## 1. Business Rules & Invariants
| ID | Rule Description | Enforcement Level |
| :--- | :--- | :--- |
| `BR_DSP_001` | A dispute can only be created for requests with `COMPLETED` status. | Strict Block |
| `BR_DSP_002` | Status transitions must follow the sequence: `RECEIVED` -> `ASSIGNED` -> `IN_REVIEW`. | Strict Block |
| `BR_DSP_003` | Only the assigned operator or an admin can modify a dispute. | Strict Block |
| `BR_DSP_004` | A resolved or rejected dispute cannot be modified by an operator. | Strict Block |
| `BR_DSP_005` | Only admins can "Reopen" a closed dispute. | Strict Block |

## 2. Technical Constraints
| Category | Constraint | Rationale |
| :--- | :--- | :--- |
| File Storage | Maximum 5 evidence files per dispute, 10MB each. | Storage Optimization |
| Blockchain | Revocation (XLS-70) must be executed using the system's Issuer wallet. | Authority Requirement |
| Database | Internal memos must be stored with a clear `is_internal` flag. | Privacy Compliance |
| Performance | SLA calculation must be updated on every status transition. | Audit Accuracy |
