import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import { ComplianceCheckResult } from '../domain/compliance/dto/compliance-check.result';
import { ComplianceTrigger } from '../domain/compliance/enum/compliance-trigger.enum';
import { ComplianceService } from '../domain/compliance/service/compliance.service';
import { ComplianceEventService } from '../domain/compliance/service/compliance-event.service';
import { MyDataCategory } from '../domain/common/enum/mydata-category.enum';
import { MyDataService } from '../domain/mydata/service/mydata.service';
import { User } from '../domain/user/entity/user.entity';
import { UserService } from '../domain/user/service/user.service';
import { UserStatus } from '../domain/user/enum/user-status.enum';
import { XrplCredentialService } from '../domain/xrpl/service/xrpl-credential.service';
import { XrplTransactionService } from '../domain/xrpl/service/xrpl-transaction.service';

@Injectable()
export class ComplianceFacade {
  private readonly logger = new Logger(ComplianceFacade.name);

  constructor(
    private readonly userService: UserService,
    private readonly mydataService: MyDataService,
    private readonly complianceService: ComplianceService,
    private readonly complianceEventService: ComplianceEventService,
    private readonly xrplCredentialService: XrplCredentialService,
    private readonly xrplTransactionService: XrplTransactionService,
  ) {}

  async checkAndApply(
    xrplAddress: string,
    triggeredBy: ComplianceTrigger,
  ): Promise<ComplianceCheckResult> {
    const user = await this.loadUser(xrplAddress);
    const visa = await this.mydataService.findLatestByUserIdAndCategory(
      user.id,
      MyDataCategory.VISA_STAY,
    );
    const tax = await this.mydataService.findLatestByUserIdAndCategory(
      user.id,
      MyDataCategory.TAX_CLEAR,
    );
    const reason = this.complianceService.evaluateRiskReason(
      visa?.rawData ?? null,
      tax?.rawData ?? null,
    );
    if (reason === null) {
      const event = await this.complianceEventService.recordNoAction(
        user.id,
        user.xrplAddress,
        triggeredBy,
      );
      return this.complianceService.buildNoActionResult(
        user.id,
        user.xrplAddress,
        event,
      );
    }

    try {
      const txResult = await this.xrplCredentialService.setDeepFreeze(
        user.xrplAddress,
      );
      await this.xrplTransactionService.recordTrustSet(
        user.id,
        user.xrplAddress,
        user.xrplAddress,
        txResult,
      );
      await this.userService.updateStatus(user.id, UserStatus.FROZEN);
      const event = await this.complianceEventService.recordFreeze(
        user.id,
        user.xrplAddress,
        triggeredBy,
        reason,
        txResult.txHash,
      );
      return this.complianceService.buildFreezeResult(
        user.id,
        user.xrplAddress,
        reason,
        txResult.txHash,
        txResult.resultCode,
        event,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`freeze failed: ${detail}`);
      const event = await this.complianceEventService.recordCheckFailed(
        user.id,
        triggeredBy,
        reason,
        detail,
      );
      return this.complianceService.buildFreezeFailedResult(
        user.id,
        user.xrplAddress,
        reason,
        event,
      );
    }
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
