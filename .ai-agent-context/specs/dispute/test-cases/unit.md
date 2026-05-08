# Dispute Unit Test Cases

## 1. Dispute Aggregate Tests
Focus on testing individual domain logic, business rules, and state transitions in isolation.

### Scenario: Calculate Least Load Operator
- **Target**: `AssignmentService.findCandidateOperators`
- **Input**: List of operators with active case counts (OpA: 2, OpB: 5, OpC: 2)
- **Expected Outcome**: `[OpA, OpC]`
- **Logic**: Verify that only operators with the absolute minimum count are returned.

### Scenario: SLA Pausing Logic
- **Target**: `Dispute.pauseSla`
- **Input**: Status change to `INFO_REQUESTED`
- **Expected Outcome**: `isSlaPaused: true`, `slaDeadline` adjustment calculated.
- **Logic**: Verify that entering the info request state stops the countdown.

### Scenario: Unauthorized Assignment Prevention
- **Target**: `Dispute.assignOperator`
- **Input**: Dispute in `RESOLVED` state
- **Expected Outcome**: `DomainError (INVALID_STATE)`
- **Logic**: Verify that closed disputes cannot be reassigned.
