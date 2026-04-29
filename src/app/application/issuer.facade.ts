import {Injectable} from '@nestjs/common';
import {ApiException} from '../interfaces/exception/api-exception';
import {ExceptionCode} from '../interfaces/exception/exception-code';
import {CredentialQueueResult} from '../domain/issuer/dto/credential-queue.result';
import {GetCredentialQueueCommand} from '../domain/issuer/dto/get-credential-queue.command';
import {
    IssuerAuthError,
    IssuerAuthErrorReason,
} from '../domain/issuer/error/issuer-auth.error';
import {IssuerAuthResult} from '../domain/issuer/dto/issuer-auth.result';
import {CredentialQueueService} from '../domain/issuer/service/credential-queue.service';
import {IssuerAuthService} from '../domain/issuer/service/issuer-auth.service';
import {IssuerCode} from '../domain/issuer/enum/issuer-code.enum';

@Injectable()
export class IssuerFacade {
    constructor(
        private readonly issuerAuthService: IssuerAuthService,
        private readonly credentialQueueService: CredentialQueueService,
    ) {
    }

    getQueue(
        command: GetCredentialQueueCommand,
    ): Promise<CredentialQueueResult> {
        return this.credentialQueueService.getQueue(command);
    }

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
