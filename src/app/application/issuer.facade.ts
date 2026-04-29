import { Injectable } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import { CredentialQueueResult } from '../domain/issuer/dto/credential-queue.result';
import { GetCredentialQueueCommand } from '../domain/issuer/dto/get-credential-queue.command';
import { IssuerAuthResult } from '../domain/issuer/dto/issuer-auth.result';
import { IssuerCode } from '../domain/issuer/enum/issuer-code.enum';
import {
  IssuerAuthError,
  IssuerAuthErrorReason,
} from '../domain/issuer/error/issuer-auth.error';
import { CredentialQueueService } from '../domain/issuer/service/credential-queue.service';
import { IssuerAuthService } from '../domain/issuer/service/issuer-auth.service';

@Injectable()
export class IssuerFacade {
  constructor(
    private readonly issuerAuthService: IssuerAuthService,
    private readonly credentialQueueService: CredentialQueueService,
  ) {}

  getQueue(
    command: GetCredentialQueueCommand,
  ): Promise<CredentialQueueResult> {
    return this.credentialQueueService.getQueue(command);
  }

  signup(
    issuerCode: IssuerCode,
    issuerName: string,
    walletAddress: string,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.signup(
        issuerCode,
        issuerName,
        walletAddress,
        adminId,
        password,
      ),
    );
  }

  login(adminId: string, password: string): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.login(adminId, password),
    );
  }

  private async mapIssuerAuthError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof IssuerAuthError)) {
        throw error;
      }
      if (error.reason === IssuerAuthErrorReason.ISSUER_ALREADY_REGISTERED) {
        throw new ApiException(
          ExceptionCode.Issuer.ALREADY_REGISTERED,
          error.data,
        );
      }
      if (error.reason === IssuerAuthErrorReason.ADMIN_ID_TAKEN) {
        throw new ApiException(
          ExceptionCode.Issuer.ADMIN_ID_TAKEN,
          error.data,
        );
      }
      if (error.reason === IssuerAuthErrorReason.ISSUER_INACTIVE) {
        throw new ApiException(ExceptionCode.Issuer.INACTIVE, error.data);
      }
      throw new ApiException(ExceptionCode.Issuer.INVALID_CREDENTIALS);
    }
  }
}
