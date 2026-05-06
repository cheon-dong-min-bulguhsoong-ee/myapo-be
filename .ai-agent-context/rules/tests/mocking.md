# When to Mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes - prefer test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Designing for Mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally. For classes, always use **Constructor Injection**:

```typescript
// Easy to mock: Port/Interface is injected
class OrderService {
  constructor(private paymentGateway: PaymentGateway) {}

  async checkout(order) {
    return this.paymentGateway.charge(order.amount);
  }
}

// Hard to mock: Concrete implementation is hidden inside
class OrderService {
  private gateway = new StripeGateway(); 
  // ...
}
```

**2. Mock Interfaces (Ports), not Concrete Classes**
When mocking, prefer to mock an interface or a "Port" defined in the domain layer. This decouples your tests from the specific infrastructure implementation.

**3. Avoid Partial Mocks (Spies)**
If you find yourself needing to mock only *some* methods of a class while keeping others real, it is a sign that the class has too many responsibilities. Break it down into smaller, focused classes instead.

**4. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each mock returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint
