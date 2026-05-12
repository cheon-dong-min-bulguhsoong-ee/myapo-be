import { Injectable } from "@nestjs/common";
import { DisputeService } from "../../domain/dispute/service/dispute.service";
import { CredentialService } from "../../domain/credential/service/credential.service";
import { IssuePipelineStage } from "../../domain/credential/enum/issue-pipeline-stage.enum";
import { IssuePipelineStageStatus } from "../../domain/credential/enum/issue-pipeline-stage-status.enum";
import { DomainError } from "../../domain/common/error/domain.error";
import { ErrorCode } from "../../domain/common/error/error-code";
import {
  DisputeResult,
  DisputeSummaryResult,
} from "../../domain/dispute/dto/dispute.result";
import { DisputeStatus } from "../../domain/dispute/enum/dispute-status.enum";
import { DisputeType } from "../../domain/dispute/enum/dispute-type.enum";

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
    targetStage: IssuePipelineStage;
    requestId: string;
    requesterId: bigint;
  }): Promise<DisputeResult> {
    // 1. 발급 요청 정보 조회
    const request = await this.credentialService.getIssueRequest(
      input.requesterId,
      input.requestId,
    );

    // 2. 대상 단계가 완료(DONE) 상태인지 확인 (ADR-003 & User Req)
    const stageInfo = request.pipeline.find((p) => p.stage === input.targetStage);
    if (!stageInfo || stageInfo.status !== IssuePipelineStageStatus.DONE) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: "Only completed stages can be disputed.",
        targetStage: input.targetStage,
        currentStatus: stageInfo?.status ?? "UNKNOWN",
      });
    }

    const result = await this.disputeService.createDispute(input);

    // 3. 프로세스 일시 중지 (ADR-003 & User Req)
    await this.credentialService.suspendIssueRequest(input.requestId);

    return result;
  }

  /**
   * 사용자의 분쟁 목록을 조회한다.
   */
  async getMyDisputes(requesterId: bigint): Promise<DisputeSummaryResult[]> {
    return this.disputeService.getMyDisputes(requesterId);
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
  async assignOperator(
    disputeId: string,
    adminId: bigint,
  ): Promise<DisputeResult> {
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
      await this.credentialService.revoke(input.credentialCode);
    }

    // 분쟁이 해결(RESOLVED)되거나 기각(REJECTED)되면 프로세스 재개
    if (
      input.newStatus === DisputeStatus.RESOLVED ||
      input.newStatus === DisputeStatus.REJECTED
    ) {
      await this.credentialService.resumeIssueRequest(result.requestId);
    }

    return result;
  }
}
