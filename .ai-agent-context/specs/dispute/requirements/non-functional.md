# Dispute Non-Functional Requirements

## 1. Performance & Reliability
| Category | Requirement | Target Threshold | Impact |
| :--- | :--- | :--- | :--- |
| Latency | Dispute detail retrieval (including timeline) | < 300ms | High |
| Availability | Dispute filing service | 99.95% | Critical |
| Consistency | SLA state must be consistent across all nodes | Strong Consistency | High |

## 2. Security & Compliance
| Rule | Description | Requirement |
| :--- | :--- | :--- |
| Data Privacy | Internal operator notes must not be leaked to public APIs | Mandatory masking |
| Audit Log | All status transitions and operator assignments must be immutable | Blockchain or Signed Log |
| Access Control | RBAC for Operators vs Admins | Role-based JWT |
| Integrity | Evidence file hashes (SHA-256) must be verified | Mandatory Hash |
