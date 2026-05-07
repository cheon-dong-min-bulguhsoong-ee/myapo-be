# User Functional Requirements

## 1. Core Scenarios (Gherkin format)

### Scenario: User Onboarding via Social Login
- **Given** A user has successfully authenticated through a Web3Auth Verifier (Google, Kakao, etc.)
- **When** The user provides their registration details (email, name, nationality) and self-custodial XRPL wallet information (address and public key)
- **Then** A new User and associated UserWallet should be created in the system

### Scenario: Prevent Duplicate Wallet Registration
- **Given** An existing XRPL address or a combination of Verifier and VerifierID is already registered in the system
- **When** A new registration attempt is made with those existing details
- **Then** The system should reject the registration with a conflict error

### Scenario: User Profile Retrieval
- **Given** An authenticated and active user exists in the system
- **When** The user requests their own profile information
- **Then** The system should return the user's details (email, name, nationality) and associated wallet information (XRPL address)

### Scenario: User Account Deletion (Soft Delete)
- **Given** An authenticated and active user exists in the system
- **When** The user requests to delete their account
- **Then** The system should mark the User and associated UserWallet as deleted (`isDelete` = true)
- **And** The user should no longer be able to log in or access the service
