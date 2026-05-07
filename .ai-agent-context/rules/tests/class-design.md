# Class Design for Testability

Designing classes with testability in mind leads to more modular and maintainable code:

1. **Constructor Dependency Injection**
   - Always inject collaborators through the constructor. This allows tests to easily provide mocks or fakes.

   ```typescript
   // GOOD: Dependencies are injected
   class UserService {
     constructor(private userRepository: UserRepository) {}

     async findUser(id: string) {
       return this.userRepository.findById(id);
     }
   }

   // BAD: Class creates its own dependencies
   class UserService {
     private userRepository = new PrismaUserRepository(); // Hard-coded dependency

     async findUser(id: string) {
       return this.userRepository.findById(id);
     }
   }
   ```

2. **Favor Composition over Inheritance**
   - Inheritance can create deep, fragile coupling that is difficult to isolate in tests. Composition makes it easier to mock specific behaviors.

3. **Small and Focused Interfaces**
   - **Interface Segregation**: Classes should implement small, specific interfaces. This makes mocking easier because you only need to implement the methods the class actually uses.
   - **Encapsulate Complexity**: Keep private methods private, but ensure the public API is sufficient for verifying the class's behavior.

4. **Avoid Static Methods and Global State**
   - Static methods are difficult to mock and can introduce hidden coupling.
   - Global state makes tests non-deterministic and hard to run in parallel.

5. **Don't do real work in constructors**
   - Constructors should only assign dependencies. Heavy logic, network calls, or file system access in a constructor makes the class impossible to instantiate in a test environment without side effects.
