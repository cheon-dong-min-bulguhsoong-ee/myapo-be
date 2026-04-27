import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../user/repository/user.repository';
import { UserNotFoundException } from '../../user/exception/user-not-found.exception';
import { UserStatus } from '../../user/enum/user-status.enum';
import { User } from '../../user/entity/user.entity';
import { MyDataCategory } from '../../mydata/enum/mydata-category.enum';
import { MyDataSnapshot } from '../../mydata/entity/mydata-snapshot.entity';
import { MyDataSnapshotRepository } from '../../mydata/repository/mydata-snapshot.repository';
import { XrplCredentialClient } from '../../xrpl/client/xrpl-credential.client';
import { SetDeepFreezeCommand } from '../../xrpl/client/command/set-deep-freeze.command';
import { XrplTxType } from '../../xrpl/enum/xrpl-tx-type.enum';
import { XrplTransactionRepository } from '../../xrpl/repository/xrpl-transaction.repository';
import { CreateXrplTransactionCommand } from '../../xrpl/repository/command/create-xrpl-transaction.command';
import { ComplianceEventType } from '../enum/compliance-event-type.enum';
import { ComplianceReason } from '../enum/compliance-reason.enum';
import { ComplianceTrigger } from '../enum/compliance-trigger.enum';
import { ComplianceAction } from '../enum/compliance-action.enum';
import { ComplianceEventRepository } from '../repository/compliance-event.repository';
import { CreateComplianceEventCommand } from '../repository/command/create-compliance-event.command';
import { ComplianceCheckResult } from '../result/compliance-check.result';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly snapshotRepository: MyDataSnapshotRepository,
    private readonly eventRepository: ComplianceEventRepository,
    private readonly xrplClient: XrplCredentialClient,
    private readonly xrplTxRepository: XrplTransactionRepository,
  ) {}

  async checkAndApply(
    xrplAddress: string,
    triggeredBy: ComplianceTrigger,
  ): Promise<ComplianceCheckResult> {
    const user = await this.loadUser(xrplAddress);

    const reason = await this.evaluateRiskReason(user.id);
    if (reason === null) {
      return this.recordNoAction(user, triggeredBy);
    }

    return this.applyFreeze(user, reason, triggeredBy);
  }

  private async loadUser(xrplAddress: string): Promise<User> {
    const user = await this.userRepository.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new UserNotFoundException(xrplAddress);
    }
    return user;
  }

  private async recordNoAction(
    user: User,
    triggeredBy: ComplianceTrigger,
  ): Promise<ComplianceCheckResult> {
    const event = await this.eventRepository.create(
      new CreateComplianceEventCommand(
        user.id,
        ComplianceEventType.CHECK_NO_ACTION,
        triggeredBy,
        null,
        null,
        { xrplAddress: user.xrplAddress },
      ),
    );
    return new ComplianceCheckResult(
      user.id,
      user.xrplAddress,
      ComplianceAction.NO_ACTION,
      null,
      null,
      null,
      event,
    );
  }

  private async applyFreeze(
    user: User,
    reason: ComplianceReason,
    triggeredBy: ComplianceTrigger,
  ): Promise<ComplianceCheckResult> {
    try {
      const txResult = await this.xrplClient.setDeepFreeze(
        new SetDeepFreezeCommand(user.xrplAddress),
      );
      await this.xrplTxRepository.create(
        new CreateXrplTransactionCommand(
          user.id,
          txResult.txHash,
          XrplTxType.TRUST_SET,
          user.xrplAddress,
          txResult.resultCode,
          txResult.rawResponse,
          user.xrplAddress,
        ),
      );
      await this.userRepository.updateStatus(user.id, UserStatus.FROZEN);
      const event = await this.eventRepository.create(
        new CreateComplianceEventCommand(
          user.id,
          ComplianceEventType.FREEZE,
          triggeredBy,
          reason,
          txResult.txHash,
          { xrplAddress: user.xrplAddress },
        ),
      );
      return new ComplianceCheckResult(
        user.id,
        user.xrplAddress,
        ComplianceAction.FREEZE,
        reason,
        txResult.txHash,
        txResult.resultCode,
        event,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`freeze failed: ${detail}`);
      const event = await this.eventRepository.create(
        new CreateComplianceEventCommand(
          user.id,
          ComplianceEventType.CHECK_FAILED,
          triggeredBy,
          reason,
          null,
          { error: detail },
        ),
      );
      return new ComplianceCheckResult(
        user.id,
        user.xrplAddress,
        ComplianceAction.NO_ACTION,
        reason,
        null,
        null,
        event,
      );
    }
  }

  private async evaluateRiskReason(
    userId: bigint,
  ): Promise<ComplianceReason | null> {
    const visa = await this.snapshotRepository.findLatestByUserIdAndCategory(
      userId,
      MyDataCategory.VISA_STAY,
    );
    const visaReason = this.evaluateVisa(visa);
    if (visaReason !== null) {
      return visaReason;
    }

    const tax = await this.snapshotRepository.findLatestByUserIdAndCategory(
      userId,
      MyDataCategory.TAX_CLEAR,
    );
    return this.evaluateTax(tax);
  }

  private evaluateVisa(snapshot: MyDataSnapshot | null): ComplianceReason | null {
    if (snapshot === null) {
      return null;
    }
    const expiry = (snapshot.rawData as { expiry_date?: string }).expiry_date;
    if (typeof expiry === 'string' && new Date(expiry) < new Date()) {
      return ComplianceReason.VISA_EXPIRED;
    }
    const status = (snapshot.rawData as { status?: string }).status;
    if (typeof status === 'string' && status !== 'ACTIVE') {
      return ComplianceReason.VISA_REVOKED;
    }
    return null;
  }

  private evaluateTax(snapshot: MyDataSnapshot | null): ComplianceReason | null {
    if (snapshot === null) {
      return null;
    }
    const cleared = (snapshot.rawData as { is_cleared?: boolean }).is_cleared;
    if (cleared === false) {
      return ComplianceReason.TAX_OVERDUE;
    }
    return null;
  }
}
