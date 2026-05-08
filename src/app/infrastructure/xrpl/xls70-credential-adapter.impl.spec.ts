import { DomainError } from '../../domain/common/error/domain.error';
import { ErrorCode } from '../../domain/common/error/error-code';
import { Xls70CredentialAdapterImpl } from './xls70-credential-adapter.impl';

describe('Xls70CredentialAdapterImpl', () => {
  const adapter = new Xls70CredentialAdapterImpl();

  it('builds an XLS-70 CredentialCreate transaction payload', () => {
    const transaction = adapter.buildCredentialCreateTransaction({
      issuerAddress: 'rISABEL',
      subjectAddress: 'rALICE',
      credentialTypeHex: '4b5943',
      expiration: 789004799,
      uri: 'isabel.com/credentials/kyc/alice',
    });

    expect(transaction).toEqual({
      TransactionType: 'CredentialCreate',
      Account: 'rISABEL',
      Subject: 'rALICE',
      CredentialType: '4B5943',
      Expiration: 789004799,
      URI: '69736162656C2E636F6D2F63726564656E7469616C732F6B79632F616C696365',
    });
  });

  it('builds an XLS-70 CredentialAccept transaction payload', () => {
    expect(adapter.buildCredentialAcceptTransaction({
      subjectAddress: 'rALICE',
      issuerAddress: 'rISABEL',
      credentialTypeHex: '4B5943',
    })).toEqual({
      TransactionType: 'CredentialAccept',
      Account: 'rALICE',
      Issuer: 'rISABEL',
      CredentialType: '4B5943',
    });
  });

  it('builds an XLS-70 CredentialDelete transaction payload with explicit subject and issuer', () => {
    expect(adapter.buildCredentialDeleteTransaction({
      submitterAddress: 'rISABEL',
      subjectAddress: 'rALICE',
      issuerAddress: 'rISABEL',
      credentialTypeHex: '4B5943',
    })).toEqual({
      TransactionType: 'CredentialDelete',
      Account: 'rISABEL',
      Subject: 'rALICE',
      Issuer: 'rISABEL',
      CredentialType: '4B5943',
    });
  });

  it('rejects CredentialDelete without a subject or issuer target', () => {
    expect(() => adapter.buildCredentialDeleteTransaction({
      submitterAddress: 'rISABEL',
      subjectAddress: null,
      issuerAddress: null,
      credentialTypeHex: '4B5943',
    })).toThrow(DomainError);

    try {
      adapter.buildCredentialDeleteTransaction({
        submitterAddress: 'rISABEL',
        subjectAddress: null,
        issuerAddress: null,
        credentialTypeHex: '4B5943',
      });
    } catch (error) {
      expect(error).toMatchObject({ errorCode: ErrorCode.Credential.XRPL_CREDENTIAL_DELETE_TARGET_REQUIRED });
    }
  });

  it('rejects an empty or oversized CredentialType', () => {
    expect(() => adapter.buildCredentialAcceptTransaction({
      subjectAddress: 'rALICE',
      issuerAddress: 'rISABEL',
      credentialTypeHex: '',
    })).toThrow(DomainError);

    expect(() => adapter.buildCredentialAcceptTransaction({
      subjectAddress: 'rALICE',
      issuerAddress: 'rISABEL',
      credentialTypeHex: 'AA'.repeat(65),
    })).toThrow(DomainError);
  });
});
