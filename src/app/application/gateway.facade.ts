import { Injectable } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import { VerifyAdmissionResult } from '../domain/gateway/verify-admission.result';
import { GatewayService } from '../domain/gateway/gateway.service';
import { UserService } from '../domain/user/user.service';
import { User } from '../domain/user/user.entity';
import { CredentialService } from '../domain/issuer/credential.service';
import { AdmissionLogService } from '../domain/gateway/admission-log.service';

const DEFAULT_DOMAIN_ID = 'CREDBUNDLE_LOAN_V1';

@Injectable()
export class GatewayFacade {
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
    private readonly admissionLogService: AdmissionLogService,
    private readonly gatewayService: GatewayService,
  ) {}

  async verify(
    xrplAddress: string,
    requester: string | null,
    domainId: string | null,
  ): Promise<VerifyAdmissionResult> {
    const user = await this.loadUser(xrplAddress);
    const activeCredentials = await this.credentialService.findActiveByUserId(
      user.id,
    );
    const missing = this.gatewayService.computeMissing(
      activeCredentials.map((credential) => credential.category),
    );
    const result = this.gatewayService.decideResult(user.isActive(), missing);
    const log = await this.admissionLogService.createVerificationLog(
      user.id,
      domainId ?? DEFAULT_DOMAIN_ID,
      result,
      missing,
      requester,
    );
    return new VerifyAdmissionResult(
      user.id,
      user.xrplAddress,
      result,
      missing,
      log,
    );
  }

  private async loadUser(xrplAddress: string): Promise<User> {
    const user = await this.userService.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new ApiException(ExceptionCode.User.USER_NOT_FOUND, {
        xrplAddress,
      });
    }
    return user;
  }
}
