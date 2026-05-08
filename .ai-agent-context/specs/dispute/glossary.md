# Dispute Glossary

## 1. Primary Business Concepts
| Business Term | System Key (Code) | Shared Definition (Plain English) | Concrete Example |
| :--- | :--- | :--- | :--- |
| **Dispute** | `DISPUTE` | A formal grievance filed by a user regarding an issued credential. | "A user reports a missing paragraph in a translated document." |
| **Operator** | `OPERATOR` | A staff member responsible for reviewing and resolving dispute cases. | "Operator A is assigned to verify a document's seal quality." |
| **Evidence** | `EVIDENCE` | Files or documentation provided by a user or operator to support or resolve a dispute. | "A photo of a blurry seal on a physical document." |
| **SLA** | `SLA` | The target time within which a dispute must be responded to or resolved. | "A typo dispute must be resolved within 12 hours." |
| **Reissue** | `REISSUE` | The process of creating a **new issuance request** (Option B) to correct errors identified in a dispute. | "Creating REQ-002 as a correction for REQ-001 based on DSP-001." |

## 2. Status & Lifecycle (How things change)
| Friendly Name | System Status | When does it enter this state? | What is the final outcome? |
| :--- | :--- | :--- | :--- |
| **Received** | `RECEIVED` | Immediately after the user submits the dispute request. | Admin reviews and assigns an operator. |
| **Assigned** | `ASSIGNED` | Once an admin confirms the operator assignment. | Operator starts the review process. |
| **In Review** | `IN_REVIEW` | When the operator explicitly clicks "Start Review". | Operator makes a decision or requests more info. |
| **Info Requested** | `INFO_REQUESTED` | When the operator needs more data from the user. | User provides evidence, leading to review resumption. |
| **Processing** | `PROCESSING` | When corrective actions (like reissuance) are being executed. | The dispute is moved to a final resolution. |
| **Resolved** | `RESOLVED` | When the operator confirms the issue is fixed. | The case is closed, and the user is notified. |
| **Rejected** | `REJECTED` | When the operator finds the grievance invalid. | The case is closed with a justification. |

## 3. External & Industry Bridge
| Industry/External Term | Our Internal Name | Mapping Role |
| :--- | :--- | :--- |
| **Revocation** | `Revoke` | Using XRPL XLS-70 `CredentialDelete` to invalidate a credential. |
| **Credential** | `RequestResult` | The document (VC) that is the subject of the dispute. |
| **Issuer** | `MyApoSystem` | The entity that has the authority to delete (revoke) the on-chain credential. |

## 4. Hallucination Guards (The "Do's and Don'ts")
- **Naming Conflict**: NEVER use `Complaint` when referring to `Dispute`.
- **Identifier Rule**: All Dispute IDs must be prefixed with `DSP-` followed by the year and sequence (e.g., `DSP-2026-0001`).
- **Context Guard**: If the user says "Close the case", clarify if they mean `RESOLVED` (fixed) or `REJECTED` (dismissed).
- **Option B Rule**: Reissuance MUST generate a **new Request ID**, never reuse the original ID for corrected work.
