import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Wallet, decode } from 'xrpl';
import { DomainError } from '../../domain/common/error/domain.error';
import { ErrorCode } from '../../domain/common/error/error-code';
import {
  XrplCredentialObjectResult,
  XrplCredentialTransactionEvidenceResult,
  XrplCredentialTransactionKind,
} from '../../domain/credential/dto/xrpl-credential-evidence.result';
import {
  BuildCredentialAcceptTransactionInput,
  BuildCredentialCreateTransactionInput,
  BuildCredentialDeleteTransactionInput,
  GetCredentialObjectsInput,
  SubmitCredentialAcceptInput,
  SubmitCredentialCreateInput,
  SubmitCredentialDeleteInput,
  XrplCredentialAcceptTransaction,
  XrplCredentialAdapter,
  XrplCredentialCreateTransaction,
  XrplCredentialDeleteTransaction,
} from '../../domain/credential/contract/xrpl-credential-adapter';

const MAX_CREDENTIAL_TYPE_BYTES = 64;
const MAX_URI_BYTES = 256;
const XRPL_EPOCH_OFFSET_SECONDS = 946684800;
const UINT32_MAX = 4294967295;
const DEFAULT_TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

type CredentialObject = {
  LedgerEntryType?: string;
  Subject?: string;
  Issuer?: string;
  CredentialType?: string;
  Flags?: number;
  Expiration?: number;
  URI?: string;
  PreviousTxnID?: string;
  PreviousTxnLgrSeq?: number;
};

@Injectable()
export class Xls70CredentialAdapterImpl extends XrplCredentialAdapter {
  constructor(private readonly configService?: ConfigService) {
    super();
  }

  getIssuerAddress(): string {
    return this.getIssuerWallet().address;
  }

  buildCredentialCreateTransaction(
    input: BuildCredentialCreateTransactionInput,
  ): XrplCredentialCreateTransaction {
    this.assertAccountAddress(input.issuerAddress, 'issuerAddress');
    this.assertAccountAddress(input.subjectAddress, 'subjectAddress');
    this.assertCredentialTypeHex(input.credentialTypeHex);

    const expiration = this.resolveExpiration(input.expiration);
    const uri = input.uri === null ? undefined : this.encodeUriToHex(input.uri);

    return {
      TransactionType: 'CredentialCreate',
      Account: input.issuerAddress,
      Subject: input.subjectAddress,
      CredentialType: input.credentialTypeHex.toUpperCase(),
      ...(expiration === undefined ? {} : { Expiration: expiration }),
      ...(uri === undefined ? {} : { URI: uri }),
    };
  }

  buildCredentialAcceptTransaction(
    input: BuildCredentialAcceptTransactionInput,
  ): XrplCredentialAcceptTransaction {
    this.assertAccountAddress(input.subjectAddress, 'subjectAddress');
    this.assertAccountAddress(input.issuerAddress, 'issuerAddress');
    this.assertCredentialTypeHex(input.credentialTypeHex);

    return {
      TransactionType: 'CredentialAccept',
      Account: input.subjectAddress,
      Issuer: input.issuerAddress,
      CredentialType: input.credentialTypeHex.toUpperCase(),
    };
  }

  buildCredentialDeleteTransaction(
    input: BuildCredentialDeleteTransactionInput,
  ): XrplCredentialDeleteTransaction {
    this.assertAccountAddress(input.submitterAddress, 'submitterAddress');
    this.assertCredentialTypeHex(input.credentialTypeHex);

    if (input.subjectAddress === null && input.issuerAddress === null) {
      throw new DomainError(ErrorCode.Credential.XRPL_CREDENTIAL_DELETE_TARGET_REQUIRED, {
        submitterAddress: input.submitterAddress,
      });
    }

    const subject = this.resolveOptionalAccountAddress(input.subjectAddress, 'subjectAddress');
    const issuer = this.resolveOptionalAccountAddress(input.issuerAddress, 'issuerAddress');

    return {
      TransactionType: 'CredentialDelete',
      Account: input.submitterAddress,
      ...(subject === undefined ? {} : { Subject: subject }),
      ...(issuer === undefined ? {} : { Issuer: issuer }),
      CredentialType: input.credentialTypeHex.toUpperCase(),
    };
  }

  async submitCredentialCreate(
    input: SubmitCredentialCreateInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const transaction = this.buildCredentialCreateTransaction(input);
    const evidence = await this.submitTransaction(
      transaction,
      this.getIssuerWallet(),
      XrplCredentialTransactionKind.CREATE,
      transaction.Account,
      transaction.Subject,
      transaction.CredentialType,
    );
    return this.withObjectSnapshot(evidence, input.subjectAddress, input.issuerAddress, input.credentialTypeHex);
  }

  async submitCredentialAccept(
    input: SubmitCredentialAcceptInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const expectedTransaction = this.buildCredentialAcceptTransaction(input);
    this.assertSignedTransactionMatches(input.signedTransactionBlob, expectedTransaction);
    const evidence = await this.submitSignedTransaction(
      input.signedTransactionBlob,
      XrplCredentialTransactionKind.ACCEPT,
      expectedTransaction.Account,
      expectedTransaction.Issuer,
      expectedTransaction.Account,
      expectedTransaction.CredentialType,
    );
    return this.withObjectSnapshot(evidence, input.subjectAddress, input.issuerAddress, input.credentialTypeHex);
  }

  async submitCredentialDelete(
    input: SubmitCredentialDeleteInput,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const expectedTransaction = this.buildCredentialDeleteTransaction(input);
    this.assertSignedTransactionMatches(input.signedTransactionBlob, expectedTransaction);
    return this.submitSignedTransaction(
      input.signedTransactionBlob,
      XrplCredentialTransactionKind.DELETE,
      expectedTransaction.Account,
      expectedTransaction.Issuer ?? null,
      expectedTransaction.Subject ?? null,
      expectedTransaction.CredentialType,
    );
  }

  async getCredentialObjects(input: GetCredentialObjectsInput): Promise<XrplCredentialObjectResult[]> {
    this.assertAccountAddress(input.accountAddress, 'accountAddress');
    const client = this.createClient();
    await client.connect();
    try {
      const response = await client.request({
        command: 'account_objects',
        account: input.accountAddress,
        ledger_index: 'validated',
        type: 'credential',
      });
      return response.result.account_objects
        .map((object) => this.toCredentialObjectResult(object as CredentialObject))
        .filter((object) => this.matchesCredentialObject(object, input));
    } finally {
      await client.disconnect();
    }
  }

  encodeUriToHex(uri: string): string {
    if (uri.length === 0) {
      throw new DomainError(ErrorCode.Credential.XRPL_URI_INVALID, { reason: 'empty' });
    }

    const uriBytes = Buffer.byteLength(uri, 'utf8');
    if (uriBytes > MAX_URI_BYTES) {
      throw new DomainError(ErrorCode.Credential.XRPL_URI_INVALID, {
        maxBytes: MAX_URI_BYTES,
        actualBytes: uriBytes,
      });
    }

    return Buffer.from(uri, 'utf8').toString('hex').toUpperCase();
  }

  toXrplExpiration(date: Date): number {
    const unixSeconds = Math.floor(date.getTime() / 1000);
    const xrplSeconds = unixSeconds - XRPL_EPOCH_OFFSET_SECONDS;
    this.assertUInt32(xrplSeconds, 'expiration');
    return xrplSeconds;
  }

  private async submitTransaction(
    transaction: XrplCredentialCreateTransaction | XrplCredentialAcceptTransaction | XrplCredentialDeleteTransaction,
    wallet: Wallet,
    transactionKind: XrplCredentialTransactionKind,
    issuer: string | null,
    subject: string | null,
    credentialType: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const client = this.createClient();
    await client.connect();
    try {
      const prepared = await client.autofill(transaction as any);
      const signed = wallet.sign(prepared);
      const response = await client.submitAndWait(signed.tx_blob);
      return this.toTransactionEvidence(response, transactionKind, transaction.Account, issuer, subject, credentialType);
    } finally {
      await client.disconnect();
    }
  }

  private async submitSignedTransaction(
    signedTransactionBlob: string,
    transactionKind: XrplCredentialTransactionKind,
    account: string,
    issuer: string | null,
    subject: string | null,
    credentialType: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const client = this.createClient();
    await client.connect();
    try {
      const response = await client.submitAndWait(signedTransactionBlob);
      return this.toTransactionEvidence(response, transactionKind, account, issuer, subject, credentialType);
    } finally {
      await client.disconnect();
    }
  }

  private async withObjectSnapshot(
    evidence: XrplCredentialTransactionEvidenceResult,
    subjectAddress: string,
    issuerAddress: string,
    credentialTypeHex: string,
  ): Promise<XrplCredentialTransactionEvidenceResult> {
    const objects = await this.getCredentialObjects({
      accountAddress: subjectAddress,
      subjectAddress,
      issuerAddress,
      credentialTypeHex,
    });
    const object = objects[0] ?? null;
    return new XrplCredentialTransactionEvidenceResult(
      evidence.transactionKind,
      evidence.network,
      evidence.transactionHash,
      evidence.engineResult,
      evidence.ledgerIndex,
      evidence.validated,
      evidence.feeDrops,
      evidence.account,
      evidence.issuer,
      evidence.subject,
      evidence.credentialType,
      object?.flags ?? evidence.flags,
      object === null ? evidence.objectSnapshot : this.objectResultToSnapshot(object),
    );
  }

  private toTransactionEvidence(
    response: any,
    transactionKind: XrplCredentialTransactionKind,
    account: string,
    issuer: string | null,
    subject: string | null,
    credentialType: string,
  ): XrplCredentialTransactionEvidenceResult {
    const result = response.result as Record<string, any>;
    const txJson = result.tx_json as Record<string, unknown> | undefined;
    const meta = result.meta as { TransactionResult?: string } | string | undefined;
    const engineResult = typeof meta === 'object' && meta.TransactionResult !== undefined
      ? meta.TransactionResult
      : result.engine_result;
    const ledgerIndex = typeof result.ledger_index === 'number' ? BigInt(result.ledger_index) : null;
    const feeDrops = typeof txJson?.Fee === 'string' ? txJson.Fee : null;

    return new XrplCredentialTransactionEvidenceResult(
      transactionKind,
      this.getNetworkName(),
      result.hash ?? txJson?.hash,
      engineResult,
      ledgerIndex,
      result.validated === true,
      feeDrops,
      account,
      issuer,
      subject,
      credentialType.toUpperCase(),
      null,
      null,
    );
  }

  private toCredentialObjectResult(object: CredentialObject): XrplCredentialObjectResult {
    return new XrplCredentialObjectResult(
      object.LedgerEntryType ?? 'Credential',
      object.Subject ?? '',
      object.Issuer ?? '',
      object.CredentialType ?? '',
      object.Flags ?? 0,
      object.Expiration ?? null,
      object.URI ?? null,
      object.PreviousTxnID ?? null,
      object.PreviousTxnLgrSeq === undefined ? null : BigInt(object.PreviousTxnLgrSeq),
    );
  }

  private objectResultToSnapshot(object: XrplCredentialObjectResult): Record<string, unknown> {
    return {
      LedgerEntryType: object.ledgerEntryType,
      Subject: object.subject,
      Issuer: object.issuer,
      CredentialType: object.credentialType,
      Flags: object.flags,
      Expiration: object.expiration,
      URI: object.uri,
      PreviousTxnID: object.previousTxnId,
      PreviousTxnLgrSeq: object.previousTxnLedgerSequence?.toString() ?? null,
    };
  }

  private matchesCredentialObject(
    object: XrplCredentialObjectResult,
    input: GetCredentialObjectsInput,
  ): boolean {
    return (input.issuerAddress === null || object.issuer === input.issuerAddress)
      && (input.subjectAddress === null || object.subject === input.subjectAddress)
      && (input.credentialTypeHex === null || object.credentialType === input.credentialTypeHex.toUpperCase());
  }


  private assertSignedTransactionMatches(
    signedTransactionBlob: string,
    expectedTransaction: XrplCredentialAcceptTransaction | XrplCredentialDeleteTransaction,
  ): void {
    let decodedTransaction: Record<string, unknown>;
    try {
      decodedTransaction = decode(signedTransactionBlob);
    } catch (error) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        fieldName: 'signedTransactionBlob',
        reason: 'decode_failed',
      });
    }

    for (const [key, expectedValue] of Object.entries(expectedTransaction)) {
      if (decodedTransaction[key] !== expectedValue) {
        throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
          fieldName: 'signedTransactionBlob',
          reason: 'transaction_mismatch',
          key,
          expectedValue,
          actualValue: decodedTransaction[key] ?? null,
        });
      }
    }
  }

  private createClient(): Client {
    return new Client(this.getTestnetUrl());
  }

  getNetworkName(): string {
    return this.getTestnetUrl();
  }

  private getTestnetUrl(): string {
    return this.getConfig('XRPL_TESTNET_URL') ?? DEFAULT_TESTNET_URL;
  }

  private getIssuerWallet(): Wallet {
    return Wallet.fromSeed(this.getRequiredConfig('WALLET_SEED'));
  }

  private getSubjectWallet(): Wallet {
    return Wallet.fromSeed(this.getRequiredConfig('XRP_SUBJECT_SEED'));
  }


  private getRequiredConfig(key: string): string {
    const value = this.getConfig(key);
    if (value === null || value.length === 0) {
      throw new DomainError(ErrorCode.Credential.XRPL_CONFIG_MISSING, { key });
    }
    return value;
  }

  private getConfig(key: string): string | null {
    return this.configService?.get<string>(key) ?? process.env[key] ?? null;
  }

  private resolveExpiration(expiration: number | null): number | undefined {
    if (expiration === null) {
      return undefined;
    }

    this.assertUInt32(expiration, 'expiration');
    return expiration;
  }

  private resolveOptionalAccountAddress(address: string | null, fieldName: string): string | undefined {
    if (address === null) {
      return undefined;
    }

    this.assertAccountAddress(address, fieldName);
    return address;
  }

  private assertAccountAddress(address: string, fieldName: string): void {
    if (address.trim().length === 0) {
      throw new DomainError(ErrorCode.Credential.XRPL_ACCOUNT_INVALID, { fieldName });
    }
  }

  private assertCredentialTypeHex(credentialTypeHex: string): void {
    if (credentialTypeHex.length === 0) {
      throw new DomainError(ErrorCode.Credential.XRPL_CREDENTIAL_TYPE_INVALID, { reason: 'empty' });
    }

    if (credentialTypeHex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(credentialTypeHex)) {
      throw new DomainError(ErrorCode.Credential.XRPL_CREDENTIAL_TYPE_INVALID, { reason: 'not_hex' });
    }

    const byteLength = credentialTypeHex.length / 2;
    if (byteLength > MAX_CREDENTIAL_TYPE_BYTES) {
      throw new DomainError(ErrorCode.Credential.XRPL_CREDENTIAL_TYPE_INVALID, {
        maxBytes: MAX_CREDENTIAL_TYPE_BYTES,
        actualBytes: byteLength,
      });
    }
  }

  private assertUInt32(value: number, fieldName: string): void {
    if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
      throw new DomainError(ErrorCode.Credential.XRPL_UINT32_INVALID, { fieldName, value });
    }
  }
}
