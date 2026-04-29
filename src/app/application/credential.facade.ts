import {Injectable} from '@nestjs/common';
import {CredentialBundleResult} from '../domain/issuer/dto/credential-bundle.result';
import {CredentialBundleService} from '../domain/issuer/service/credential-bundle.service';
import {IssuerCode} from '../domain/issuer/enum/issuer-code.enum';
import {UserService} from '../domain/user/service/user.service';
import {ApiException} from '../interfaces/exception/api-exception';
import {ExceptionCode} from '../interfaces/exception/exception-code';

@Injectable()
export class CredentialFacade {
    constructor(
        private readonly userService: UserService,
        private readonly credentialBundleService: CredentialBundleService,
    ) {
    }

    async requestBundle(
        xrplAddress: string,
        issuerCodes: IssuerCode[],
    ): Promise<CredentialBundleResult> {
        if (!issuerCodes.includes(IssuerCode.TOSS_ARC)) {
            throw new ApiException(ExceptionCode.Issuer.CREDENTIAL_KYC_REQUIRED);
        }

        const user = await this.userService.findByXrplAddress(xrplAddress);
        if (user === null) {
            throw new ApiException(ExceptionCode.User.USER_NOT_FOUND, {xrplAddress});
        }
        if (!user.isActive()) {
            throw new ApiException(ExceptionCode.User.USER_NOT_ACTIVE, {
                userId: user.id.toString(),
                status: user.status,
            });
        }

        const {bundle, requests} =
            await this.credentialBundleService.createForUser(user.id, issuerCodes);
        return new CredentialBundleResult(bundle, requests);
    }
}
