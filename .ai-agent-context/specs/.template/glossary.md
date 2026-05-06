# [Domain Name] Glossary

## 1. Primary Business Concepts
This section defines the "What" and "How" for everyone. It maps human-friendly terms to system identifiers to ensure the AI doesn't invent its own naming.

| Business Term | System Key (Code) | Shared Definition (Plain English) | Concrete Example |
| :--- | :--- | :--- | :--- |
| **[Term Name]** | `[code_symbol]` | Simple, unambiguous explanation that a non-tech person understands. | (e.g., "A digital vault that holds assets until conditions are met.") |
| **[Term Name]** | `[code_symbol]` | | |

## 2. Status & Lifecycle (How things change)
Defines the stages a process goes through. This prevents the AI from using incorrect status names or missing transition steps.

| Friendly Name | System Status | When does it enter this state? | What is the final outcome? |
| :--- | :--- | :--- | :--- |
| **[e.g., Waiting]** | `PENDING` | Immediately after the user submits the request. | User must confirm via email. |
| **[e.g., Finished]** | `COMPLETED` | Once the transaction is signed on XRPL. | Assets are moved to the buyer. |

## 3. External & Industry Bridge
Links our internal language to external standards (like XRPL or DID) to prevent confusion during integration.

| Industry/External Term | Our Internal Name | Mapping Role |
| :--- | :--- | :--- |
| **[e.g., Trustline]** | `AssetConnection` | Enables our system to hold non-XRP tokens. |
| **[e.g., XLS-20]** | `NftStandard` | The protocol we use for minting credentials. |

## 4. Hallucination Guards (The "Do's and Don'ts")
Strict rules to prevent linguistic drift and ensure the AI remains consistent with the project's specific dialect.

- **Naming Conflict**: NEVER use `[Wrong Term]` (e.g., Account) when referring to `[Right Term]` (e.g., Wallet).
- **Identifier Rule**: All IDs for this domain must be prefixed with `[Prefix]_` (e.g., `ESC_`).
- **Context Guard**: If the user says "[Ambiguous Word]", the AI must clarify if they mean "[Meaning A]" or "[Meaning B]".
