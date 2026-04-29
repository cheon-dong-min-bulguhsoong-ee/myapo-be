import { Injectable } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import {
  IssuerAuthError,
  IssuerAuthErrorReason,
} from '../domain/issuer/error/issuer-auth.error';
import { IssuerAuthResult } from '../domain/issuer/dto/issuer-auth.result';
import { IssuerAuthService } from '../domain/issuer/service/issuer-auth.service';
import { IssuerCode } from '../domain/issuer/enum/issuer-code.enum';

@Injectable()
export class IssuerFacade {
  constructor(private readonly issuerAuthService: IssuerAuthService) {}

  signup(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.signup(issuerCode, adminId, password),
    );
  }

  login(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.login(issuerCode, adminId, password),
    );
  }

  private async mapIssuerAuthError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof IssuerAuthError)) {
        throw error;
      }
      if (error.reason === IssuerAuthErrorReason.ADMIN_ALREADY_EXISTS) {
        throw new ApiException(
          ExceptionCode.Issuer.ADMIN_ALREADY_EXISTS,
          error.data,
        );
      }
      if (error.reason === IssuerAuthErrorReason.ADMIN_INACTIVE) {
        throw new ApiException(ExceptionCode.Issuer.ADMIN_INACTIVE, error.data);
      }
      throw new ApiException(ExceptionCode.Issuer.INVALID_CREDENTIALS);
    }
  }
}
