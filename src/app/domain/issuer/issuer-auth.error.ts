import { IssuerCode } from './issuer-code.enum';

export enum IssuerAuthErrorReason {
  ADMIN_ALREADY_EXISTS = 'ADMIN_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ADMIN_INACTIVE = 'ADMIN_INACTIVE',
}

export class IssuerAuthError extends Error {
  private constructor(
    public readonly reason: IssuerAuthErrorReason,
    public readonly data: unknown = null,
  ) {
    super(reason);
    this.name = 'IssuerAuthError';
  }

  static adminAlreadyExists(
    issuerCode: IssuerCode,
    adminId: string,
  ): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.ADMIN_ALREADY_EXISTS, {
      issuerCode,
      adminId,
    });
  }

  static invalidCredentials(): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.INVALID_CREDENTIALS);
  }

  static adminInactive(status: string): IssuerAuthError {
    return new IssuerAuthError(IssuerAuthErrorReason.ADMIN_INACTIVE, {
      status,
    });
  }
}
