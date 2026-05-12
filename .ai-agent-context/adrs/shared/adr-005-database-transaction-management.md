# ADR-005: Database Transaction Management

## Status
accepted

## Context
- **Current State**: The project's architecture guide does not specify a standardized approach for managing database transactions. Individual developers might implement transaction logic manually (e.g., using `prisma.$transaction`), leading to inconsistent, error-prone, and boilerplate-heavy code.
- **Problem**: Complex use cases often involve multiple database write operations across different domain services (e.g., creating a user and their initial wallet). Without an atomic transaction wrapping these operations, a partial failure can leave the database in an inconsistent state, corrupting data and causing bugs.
- **Constraints**: The solution must integrate seamlessly with NestJS, Prisma, and our Clean Layered Architecture. It should be declarative and minimally invasive.

## Decision
- **Our Choice**: We will adopt the `@nestjs-cls/transactional` library to manage database transactions declaratively.
- **Rationale for Choice**:
  - `@nestjs-cls/transactional` uses Continuation-Local Storage (CLS) to implicitly propagate the transaction context across service calls, avoiding the need for manual passing of transaction objects.
  - The `@Transactional()` decorator provides a clean, declarative way to define transaction boundaries at the use-case level (i.e., on Facade methods).
  - It has a dedicated Prisma adapter (`@nestjs-cls/transactional-adapter-prisma`) that works out-of-the-box with our existing ORM setup.
  - This approach centralizes transaction logic, reduces boilerplate, and improves code readability and maintainability.
- **Rejected Alternatives**:
  - **Manual `prisma.$transaction`**: This was rejected because it is imperative, adds boilerplate to every use case, and is prone to developer error (e.g., forgetting to pass the transaction client).
  - **Custom Decorator**: Building a custom solution would reinvent the wheel and require significant effort to maintain and test. `@nestjs-cls/transactional` is a well-maintained and tested community solution.

## Rules (LLM Important)
- **MUST**:
  - Use the `@Transactional()` decorator on public methods in `*.facade.ts` files for any use case involving two or more database write operations.
  - Ensure the `app.module.ts` (or a global module) correctly configures the `ClsPluginTransactional` with the `TransactionalAdapterPrisma`.
- **MUST NOT**:
  - Manually manage transactions using `prisma.$transaction` within any layer.
  - Apply the `@Transactional()` decorator within the `domain/` or `infrastructure/` layers. The transaction boundary is a use-case concern, which belongs in the `application/` layer (Facades).
- **SHOULD**:
  - Place the `@Transactional()` decorator on the Facade method that represents the entire use case to ensure all operations within that use case are atomic.

## Impact
- **Advantages**:
  - Guarantees data consistency for complex operations.
  - Simplifies development by abstracting away transaction management logic.
  - Improves code readability by clearly marking transactional boundaries.
- **Disadvantages**:
  - Adds a new library dependency (`@nestjs-cls/transactional` and its adapter).
  - Developers need to learn the correct usage of the `@Transactional()` decorator and its propagation options.
- **Trade-offs**: We accept the cost of an additional dependency for the significant gain in data integrity and developer productivity.

## Scope
- **Area of Application**: Application Layer, specifically Use Case Facades.
- **Affected Components**:
  - All `*.facade.ts` files in `src/app/application/`.
  - The root module (`app.module.ts`) for configuration.
  - `package.json` for the new dependencies.

## Example

### Before
```typescript
// in a Facade or Service
async createUserAndWallet(data) {
  // No transaction, if createWallet fails, user remains.
  const user = await this.userRepository.create(data);
  const wallet = await this.walletRepository.create({ userId: user.id });
  return { user, wallet };
}
```

### After
```typescript
// in a Facade
@Transactional()
async createUserAndWallet(data) {
  // The whole method is atomic.
  const user = await this.userService.create(data); // uses repository internally
  const wallet = await this.walletService.create({ userId: user.id }); // uses repository internally
  return RegisterUserRes.from({ user, wallet });
}
```

## Related
- **domain**: N/A
- **api**: N/A
- **other adr**: N/A
