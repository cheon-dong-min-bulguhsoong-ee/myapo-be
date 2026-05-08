# Dispute E2E Test Cases

## 1. User Journey: From Complaint to Resolution
High-level verification of the full dispute lifecycle.

### Case: Successful Resolution with Revocation
1.  **Request**: `POST /api/v1/disputes` as User (with valid REQ ID).
2.  **Response**: Expect `201 Created`.
3.  **Request**: `PATCH /api/v1/disputes/{id}/assign` as Admin (assigning OP_001).
4.  **Response**: Expect `200 OK`.
5.  **Request**: `PATCH /api/v1/disputes/{id}/status` as Operator (to `IN_REVIEW`).
6.  **Request**: `POST /api/v1/disputes/{id}/resolve` as Operator (with `RESOLVED`, `executeRevoke: true`).
7.  **Response**: Expect `200 OK`.
8.  **Verification**: Check if XRPL mock service received a deletion request.
