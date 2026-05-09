import { Injectable } from '@nestjs/common';
import { DisputeService } from '../../domain/dispute/service/dispute.service';
import { CredentialService } from '../../domain/credential/service/credential.service';
import { DisputeResult } from '../../domain/dispute/dto/dispute.result';
import { DisputeStatus } from '../../domain/dispute/enum/dispute-status.enum';
import { DisputeType } from '../../domain/dispute/enum/dispute-type.enum';

@Injectable()
export class DisputeFacade {
  constructor(
    private readonly disputeService: DisputeService,
    private readonly credentialService: CredentialService,
  ) {}

  /**
   * 분쟁을 생성한다.
   */
  async createDispute(input: {
    type: DisputeType;
    requestId: string;
    requesterId: bigint;
  }): Promise<DisputeResult> {
    return this.disputeService.createDispute(input);
  }

  /**
   * 분쟁 상세를 조회한다.
   */
  async getDispute(id: string, requesterId?: bigint): Promise<DisputeResult> {
    return this.disputeService.getDispute(id, requesterId);
  }

  /**
   * 운영자를 배정한다 (Admin 전용).
   */
  async assignOperator(disputeId: string, adminId: bigint): Promise<DisputeResult> {
    return this.disputeService.assignOperator(disputeId, adminId);
  }

  /**
   * 분쟁 상태를 변경하고, 해결(RESOLVED) 시 크리덴셜을 취소한다.
   */
  async changeStatus(input: {
    id: string;
    newStatus: DisputeStatus;
    operatorId: bigint;
    note: string | null;
    isInternal: boolean;
    credentialCode?: string; // 취소할 크리덴셜 코드
  }): Promise<DisputeResult> {
    const result = await this.disputeService.changeStatus(input);

    // ADR-003: RESOLVED 상태가 되면 시스템이 직접 크리덴셜 취소 실행
    if (input.newStatus === DisputeStatus.RESOLVED && input.credentialCode) {
      // CredentialService의 revoke API 사용
      await this.credentialService.revoke(input.credentialCode, `DISPUTE:${input.id}`);
    }

    return result;
  }
}
