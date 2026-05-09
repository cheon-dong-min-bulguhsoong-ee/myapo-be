import {
  XrplCredentialObjectResult,
  XrplCredentialTransactionEvidenceResult,
} from '../dto/xrpl-credential-evidence.result';

export interface BuildCredentialCreateTransactionInput {
  readonly issuerAddress: string;
  readonly subjectAddress: string;
  readonly credentialTypeHex: string;
  readonly expiration: number | null;
  readonly uri: string | null;
}

export interface BuildCredentialAcceptTransactionInput {
  readonly subjectAddress: string;
  readonly issuerAddress: string;
  readonly credentialTypeHex: string;
}

export interface BuildCredentialDeleteTransactionInput {
  readonly submitterAddress: string;
  readonly subjectAddress: string | null;
  readonly issuerAddress: string | null;
  readonly credentialTypeHex: string;
}

export interface SubmitCredentialCreateInput extends BuildCredentialCreateTransactionInput {}
export interface SubmitCredentialAcceptInput extends BuildCredentialAcceptTransactionInput {
  readonly signedTransactionBlob: string;
}
export interface SubmitCredentialDeleteInput extends BuildCredentialDeleteTransactionInput {
  readonly signedTransactionBlob: string;
}

export interface GetCredentialObjectsInput {
  readonly accountAddress: string;
  readonly issuerAddress: string | null;
  readonly subjectAddress: string | null;
  readonly credentialTypeHex: string | null;
}

export interface XrplCredentialCreateTransaction {
  readonly TransactionType: 'CredentialCreate';
  readonly Account: string;
  readonly Subject: string;
  readonly CredentialType: string;
  readonly Expiration?: number;
  readonly URI?: string;
}

export interface XrplCredentialAcceptTransaction {
  readonly TransactionType: 'CredentialAccept';
  readonly Account: string;
  readonly Issuer: string;
  readonly CredentialType: string;
}

export interface XrplCredentialDeleteTransaction {
  readonly TransactionType: 'CredentialDelete';
  readonly Account: string;
  readonly Subject?: string;
  readonly Issuer?: string;
  readonly CredentialType: string;
}

export abstract class XrplCredentialAdapter {
  abstract getIssuerAddress(): string;

  abstract buildCredentialCreateTransaction(
    input: BuildCredentialCreateTransactionInput,
  ): XrplCredentialCreateTransaction;

  abstract buildCredentialAcceptTransaction(
    input: BuildCredentialAcceptTransactionInput,
  ): XrplCredentialAcceptTransaction;

  abstract buildCredentialDeleteTransaction(
    input: BuildCredentialDeleteTransactionInput,
  ): XrplCredentialDeleteTransaction;

  abstract submitCredentialCreate(
    input: SubmitCredentialCreateInput,
  ): Promise<XrplCredentialTransactionEvidenceResult>;

  abstract submitCredentialAccept(
    input: SubmitCredentialAcceptInput,
  ): Promise<XrplCredentialTransactionEvidenceResult>;

  abstract submitCredentialDelete(
    input: SubmitCredentialDeleteInput,
  ): Promise<XrplCredentialTransactionEvidenceResult>;

  abstract getCredentialObjects(input: GetCredentialObjectsInput): Promise<XrplCredentialObjectResult[]>;

  abstract getNetworkName(): string;

  abstract encodeUriToHex(uri: string): string;

  abstract toXrplExpiration(date: Date): number;
}
