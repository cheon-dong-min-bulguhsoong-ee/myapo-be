export enum CredentialRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVOKED = 'REVOKED',
}

export const CREDENTIAL_REQUEST_STATUSES = Object.values(
  CredentialRequestStatus,
);
