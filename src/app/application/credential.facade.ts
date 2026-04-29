import { Injectable } from '@nestjs/common';
import { CredentialBundleResult } from '../domain/issuer/dto/credential-bundle.result';
import { CredentialBundleService } from '../domain/issuer/service/credential-bundle.service';
import { IssuerCode } from '../domain/issuer/enum/issuer-code.enum';
import { User } from '../domain/user/entity/user.entity';
import { UserService } from '../domain/user/service/user.service';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';

@Injectable()
export class CredentialFacade {
  constructor(
    private readonly userService: UserService,
    private readonly credentialBundleService: CredentialBundleService,
  ) {}

  async requestBundle(
    xrplAddress: string,
    issuerCodes: IssuerCode[],
  ): Promise<CredentialBundleResult> {
    const user = await this.loadActiveUser(xrplAddress);
    const { bundle, requests } = await this.credentialBundleService.createForUser(
      user.id,
      issuerCodes,
    );
    return new CredentialBundleResult(bundle, requests);
  }

  private async loadActiveUser(xrplAddress: string): Promise<User> {
    const user = await this.userService.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new ApiException(ExceptionCode.User.USER_NOT_FOUND, { xrplAddress });
    }
    if (!user.isActive()) {
      throw new ApiException(ExceptionCode.User.USER_NOT_ACTIVE, {
        userId: user.id.toString(),
        status: user.status,
      });
    }
    return user;
  }
}
