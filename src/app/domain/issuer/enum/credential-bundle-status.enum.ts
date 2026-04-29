export enum CredentialBundleStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PARTIALLY_FAILED = 'PARTIALLY_FAILED',
  FAILED = 'FAILED',
}

export const CREDENTIAL_BUNDLE_STATUSES = Object.values(CredentialBundleStatus);
