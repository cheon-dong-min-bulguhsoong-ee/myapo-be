# User Constraints

## 1. Business Rules & Invariants
| ID | Rule Description | Enforcement Level |
| :--- | :--- | :--- |
| `BR_USR_001` | **Immutable Nationality**: User nationality must be set at registration and cannot be modified later. | Strict Block |
| `BR_USR_002` | **Uniqueness**: User email, XRPL Address, and the combination of (Verifier, VerifierID) must be unique across the system. | Strict Block |
| `BR_USR_003` | **Relationship**: A User can have exactly one UserWallet (1:1 relationship). | Strict Block |
| `BR_USR_004` | **Data Format**: Nationality must follow ISO 3166-1 alpha-2 format (e.g., "KR", "VN"). | Strict Block |

## 2. Technical Constraints
| Category | Constraint | Rationale |
| :--- | :--- | :--- |
| Database | Use Soft Deletes (`isDelete` flag) instead of physical deletion. | Audit & Data Integrity |
| Security | Server must verify XRPL signatures using the stored `publicKey`. | Self-custodial Verification |
| Auth | Authentication and VerifierID are provided by Web3Auth. | External Login Provider |
| Session | **Layer Separation**: Distinguish between the Internal JWT (App Session) and Web3Auth (IdP Session). | Security & UX Flexibility |
| Logout | **Stateless Disposal**: Server logout focus is on Application Session termination. External session cleanup is a client-side SDK responsibility. | Stateless Architecture |
