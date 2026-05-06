# Decisions (ADR) Guide

This directory contains Architecture Decision Records (ADR), organized by domain subdirectories to maintain clarity and scalability.

## Directory Structure

- **`template.md`**: The required format for all new ADRs.
- **`shared/`**: Contains common ADRs that MUST be followed by all domains (cross-cutting concerns).
- **`<domain>/`**: Subdirectories representing different bounded contexts (e.g., `auth/`, `user/`, `credential/`).
    - **`adr-XXX-name.md`**: Individual decision records located within their respective domain folders.

## Discovery & Reading Order (IMPORTANT)

When working with decisions, follow these steps:

1. **Identify Domain**: Determine which domain(s) your task impacts.
2. **Scan Shared ADRs**: ALWAYS check the `shared/` folder first, as these decisions apply universally.
3. **Scan Domain Subdirectories**: Look into the relevant domain folder for domain-specific decisions.
4. **Read Format**: Reference `template.md` if creating a new record.

## Rules (MANDATORY)

- **MUST**:
    - Place new ADRs in the appropriate domain subdirectory.
    - Use the filename format `adr-XXX-name.md`.
    - Follow `template.md` exactly when creating a new ADR.
    - Keep sections and headings unchanged.
    - Write in structured bullet format.
    - Engage in a minimum of 7 distinct turns of Q&A (7-depth interview) with the user to thoroughly explore and confirm all design and implementation details.

- **MUST NOT**:
    - Place ADR files directly in the root of the `adrs/` directory (except for `README.md` and `template.md`).
    - Skip sections from `template.md`.
    - Change section names.

- **SHOULD**:
    - Keep each ADR focused on a single decision.
    - Link related ADRs in the "Related" section.

## When Creating a New ADR

1. Search relevant domain subdirectories for similar existing decisions.
2. Identify the correct target domain subdirectory.
3. Copy `template.md` into that subdirectory as `adr-XXX-name.md`.
4. Fill all sections thoroughly.
5. If the decision impacts multiple domains, place it in `shared/`. 



