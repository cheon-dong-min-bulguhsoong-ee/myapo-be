# Decisions (ADR) Guide

This directory contains Architectural Decision Records (ADR), organized by domain subdirectories to maintain clarity and scalability.

---

## GLOBAL CONTEXT (READ FIRST)

The ADR directory structure is strictly enforced:

- **`template.md`**: The required format for all new ADRs.
- **`shared/`**: Contains cross-cutting ADRs that MUST be followed by all domains.
- **`<domain>/`**: Subdirectories for specific bounded contexts (e.g., `auth/`, `user/`).
    - **`adr-XXX-name.md`**: Individual records within their respective folders.

---

## DISCOVERY & READING ORDER (IMPORTANT)

When analyzing decisions, AI agents MUST follow this sequence:

1. **Identify Domain**: Determine the target domain(s) of the task.
2. **Scan Shared ADRs**: ALWAYS check the `shared/` folder first for universal rules.
3. **Scan Domain Subdirectories**: Read relevant domain folders for specific decisions.
4. **Read Format**: Consult `template.md` if the task requires a new record.

---

## ADR RULES (MANDATORY)

- **MUST**:
    - Place new ADRs in the appropriate domain subdirectory.
    - Use the filename format `adr-XXX-name.md`.
    - Follow `template.md` exactly when creating a new ADR.
    - Keep all sections and headings from the template unchanged.
    - Write in structured bullet format for readability.
    - **Engage in a 7-depth interview**: Perform a minimum of 7 distinct turns of Q&A with the user to thoroughly explore all design details before finalizing an ADR.

- **MUST NOT**:
    - Place ADR files directly in the root of the `adrs/` directory (except `README.md` and `template.md`).
    - Skip or rename sections from the template.

---

## CREATION PROTOCOL

1. Search all subdirectories to ensure no duplicate decision exists.
2. Copy `template.md` to the target domain folder (or `shared/`).
3. Fill all sections with the rationale gathered from the user interview.
4. Link related ADRs in the "Related" section to maintain the decision graph.

---

## EXECUTION MODE

This document MUST be treated as:
- source of truth for decision discovery
- mandatory rule set for ADR management
- implementation controller for technical rationale

ALL actions involving architectural decisions MUST comply with this document.
