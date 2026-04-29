export enum CredentialRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const CREDENTIAL_REQUEST_STATUSES = Object.values(
  CredentialRequestStatus,
);
