import { IssuerCode } from '../enum/issuer-code.enum';

export enum IssuerAuthErrorReason {
  ISSUER_ALREADY_REGISTERED = 'ISSUER_ALREADY_REGISTERED',
  ADMIN_ID_TAKEN = 'ADMIN_ID_TAKEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ISSUER_INACTIVE = 'ISSUER_INACTIVE',
}

export class IssuerAuthError extends Error {
  private constructor(
    public readonly reason: IssuerAuthErrorReason,
    public readonly data: unknown = null,
  ) {
    super(reason);
    this.name = 'IssuerAuthError';
  }

  static issuerAlreadyRegistered(issuerCode: IssuerCode): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.ISSUER_ALREADY_REGISTERED, {
      issuerCode,
    });
  }

  static adminIdTaken(adminId: string): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.ADMIN_ID_TAKEN, {
      adminId,
    });
  }

  static invalidCredentials(): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.INVALID_CREDENTIALS);
  }

  static issuerInactive(status: string): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.ISSUER_INACTIVE, {
      status,
    });
  }
}
