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

### Scenario: Application Session Logout (Basic)
- **Given** An authenticated user is logged into the application
- **When** The user requests a basic logout
- **Then** The system should invalidate the Internal Access Token (server-side record or client-side disposal)
- **And** The application session should be terminated, requiring re-authentication for further access

### Scenario: Full Session Logout (Account Switch/Public Device)
- **Given** An authenticated user is logged into the application via Web3Auth
- **When** The user requests a full logout for account switching or security on a shared device
- **Then** The system should terminate the application session
- **And** The client should trigger the Web3Auth SDK logout to clear external identity provider sessions
