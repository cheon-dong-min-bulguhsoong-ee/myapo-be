import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repository/user.repository';
import { UserNotFoundException } from '../../user/exception/user-not-found.exception';
import { User } from '../../user/entity/user.entity';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../../mydata/enum/mydata-category.enum';
import { CredentialRepository } from '../../issuer/repository/credential.repository';
import { Credential } from '../../issuer/entity/credential.entity';
import { AdmissionResult } from '../enum/admission-result.enum';
import { AdmissionLogRepository } from '../repository/admission-log.repository';
import { CreateAdmissionLogCommand } from '../repository/command/create-admission-log.command';
import { VerifyAdmissionResult } from '../result/verify-admission.result';

const DEFAULT_DOMAIN_ID = 'CREDBUNDLE_LOAN_V1';

@Injectable()
export class GatewayService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly admissionLogRepository: AdmissionLogRepository,
  ) {}

  async verify(
    xrplAddress: string,
    requester: string | null,
    domainId: string | null,
  ): Promise<VerifyAdmissionResult> {
    const user = await this.loadUser(xrplAddress);
    const activeCredentials =
      await this.credentialRepository.findActiveByUserId(user.id);
    const missing = this.computeMissing(activeCredentials);
    const result = this.decideResult(user, missing);
    const log = await this.admissionLogRepository.create(
      new CreateAdmissionLogCommand(
        user.id,
        domainId ?? DEFAULT_DOMAIN_ID,
        result,
        missing,
        requester,
      ),
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
    const user = await this.userRepository.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new UserNotFoundException(xrplAddress);
    }
    return user;
  }

  private computeMissing(activeCredentials: Credential[]): MyDataCategory[] {
    const owned = new Set<MyDataCategory>();
    for (const credential of activeCredentials) {
      owned.add(credential.category);
    }
    const missing: MyDataCategory[] = [];
    for (const category of MYDATA_CATEGORIES) {
      if (!owned.has(category)) {
        missing.push(category);
      }
    }
    return missing;
  }

  private decideResult(
    user: User,
    missing: MyDataCategory[],
  ): AdmissionResult {
    if (!user.isActive()) {
      return AdmissionResult.DENIED;
    }
    if (missing.length > 0) {
      return AdmissionResult.DENIED;
    }
    return AdmissionResult.GRANTED;
  }
}
