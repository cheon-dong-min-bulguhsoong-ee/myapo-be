# Testing and Validation

Procedures for building, testing, and verifying code changes. For the implementation process itself, refer to [TDD Rules](./tdd.md).

## 1. Project Commands

### 1.1 Development & Build
- `npm run build`: Build the project (tsc/nest build) to verify compilation.
- `npm run lint -- --fix`: Run ESLint and apply automatic fixes.
- `tsc --noEmit`: Perform a full type-check without generating output.
- `npx prisma generate`: Regenerate the Prisma client after schema changes.

### 1.2 Testing
- `npm run test:unit`: Run Jest unit tests.
- `npm run test:integration`: Run integration tests.
- `npm run test:e2e`: Run end-to-end tests.

## 2. Test Quality Principles

To ensure tests remain maintainable and support refactoring, follow these principles for writing "Good" tests.

### 2.1 Focus on Behavior (Good Tests)
Tests should verify **observable behavior** through real interfaces, not mocks of internal parts. A good test describes *WHAT* the system does, not *HOW* it does it.

```typescript
// GOOD: Tests observable behavior through public API
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

**Characteristics of Good Tests:**
- Tests behavior that users or callers actually care about.
- Uses public APIs only, ensuring they survive internal refactors.
- One logical assertion per test case.

### 2.2 Avoid Implementation Details (Bad Tests)
Tests that are coupled to internal structure are fragile and hinder refactoring. These are "Bad" tests because they break when the code is improved, even if the behavior remains the same.

```typescript
// BAD: Coupled to implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

**Red Flags (Avoid These):**
- Mocking internal collaborators or private methods.
- Asserting on call counts or call order.
- Bypassing the public interface to verify internal state (e.g., direct DB queries).

```typescript
// BAD: Bypassing interface to verify state
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifying through the public interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

## 3. Validation Loop (Critical)

After implementation, execute this loop until all checks pass:
1. **Build**: Run `npm run build`.
2. **Lint**: Run `npm run lint`.
3. **Type-Check**: Run type checks.
4. **Test**: Run tests relevant to the impacted scope.
5. **Fix**: Analyze and fix all errors or failures.
6. **Re-run**: Start the loop again from step 1.

Exit the loop ONLY when all checks are green. **DO NOT** ignore errors or skip validation.

## 4. Completion Requirements

A task is NOT complete until:
- Build succeeds.
- Lint has ZERO errors.
- Type checks pass.
- All relevant tests (unit/integration/E2E) pass.
- No failing scenarios remain in the TDD specification.
- No unused imports, variables, or "dead" code.
- Code strictly follows all naming and coding conventions.
