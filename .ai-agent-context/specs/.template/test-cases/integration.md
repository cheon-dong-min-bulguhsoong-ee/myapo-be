# [Domain Name] Integration Test Cases

## 1. Database & Persistence Flows
Verify that domain entities are correctly mapped and persisted in the database.

### Scenario: [Flow Name] (e.g., Save and Retrieve Aggregate)
- **Step 1**: Create a new entity via a repository.
- **Step 2**: Retrieve the entity by ID.
- **Expectation**: Data retrieved matches the data saved, including all relations.

## 2. Cross-Module/Service Communication
Verify interactions between this domain and external services or other modules.

### Scenario: [Interaction Name] (e.g., Trigger Event on Success)
- **Action**: Execute a Use Case that fires a domain event.
- **Verification**: Check if the event is correctly published to the event bus/handler.
- **Expectation**: Downstream subscribers receive the expected payload.
