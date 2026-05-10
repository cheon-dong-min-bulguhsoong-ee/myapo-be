import { Injectable } from "@nestjs/common";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import {
  DisputeResult,
  DisputeSummaryResult,
  TimelineEntryResult,
} from "../dto/dispute.result";
import { Dispute, TimelineEntry } from "../entity/dispute.entity";
import { DisputeStatus } from "../enum/dispute-status.enum";
import { DisputeType } from "../enum/dispute-type.enum";
import { DisputeRepository } from "../repository/dispute.repository";

@Injectable()
export class DisputeService {
  constructor(private readonly disputeRepository: DisputeRepository) {}

  /**
   * 새로운 분쟁을 생성한다.
   */
  async createDispute(input: {
    type: DisputeType;
    requestId: string;
    requesterId: bigint;
  }): Promise<DisputeResult> {
    const id = this.generateDisputeId();
    const slaDeadline = this.calculateSlaDeadline(input.type);

    const dispute = await this.disputeRepository.create({
      id,
      type: input.type,
      requestId: input.requestId,
      requesterId: input.requesterId,
      status: DisputeStatus.RECEIVED,
      slaDeadline,
    });

    await this.logTimeline(
      id,
      DisputeStatus.RECEIVED,
      "Dispute created.",
      null,
      false,
    );

    return this.mapToResult(dispute);
  }

  /**
   * 분쟁 상세 정보를 조회한다.
   */
  async getDispute(id: string, requesterId?: bigint): Promise<DisputeResult> {
    const dispute = await this.disputeRepository.findById(id);
    if (!dispute) {
      throw new DomainError(ErrorCode.Common.NOT_FOUND, {
        message: "Dispute not found.",
      });
    }

    // 작성자 본인 확인 (필요시)
    if (requesterId && dispute.requesterId !== requesterId) {
      throw new DomainError(ErrorCode.Common.FORBIDDEN);
    }

    return this.mapToResult(dispute, requesterId !== undefined);
  }

  /**
   * 운영자를 배정한다 (최소 부하 방식 + 랜덤 타이브레이크).
   */
  async assignOperator(
    disputeId: string,
    adminId: bigint,
  ): Promise<DisputeResult> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) throw new DomainError(ErrorCode.Common.NOT_FOUND);

    const workloads = await this.disputeRepository.getOperatorWorkloads();
    if (workloads.length === 0) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: "No operators available.",
      });
    }

    // 최소 부하 운영자 선정 (ADR-003)
    const minLoad = Math.min(...workloads.map((w) => w.activeCount));
    const candidates = workloads.filter((w) => w.activeCount === minLoad);
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    dispute.assignOperator(selected.operatorId);
    await this.disputeRepository.update(dispute);
    await this.logTimeline(
      disputeId,
      DisputeStatus.ASSIGNED,
      `Operator assigned (ID: ${selected.operatorId})`,
      adminId,
      true,
    );

    return this.mapToResult(dispute);
  }

  /**
   * 상태를 변경한다.
   */
  async changeStatus(input: {
    id: string;
    newStatus: DisputeStatus;
    operatorId: bigint;
    note: string | null;
    isInternal: boolean;
  }): Promise<DisputeResult> {
    const dispute = await this.disputeRepository.findById(input.id);
    if (!dispute) throw new DomainError(ErrorCode.Common.NOT_FOUND);

    dispute.changeStatus(
      input.newStatus,
      input.operatorId,
      input.note,
      input.isInternal,
    );
    await this.disputeRepository.update(dispute);
    await this.logTimeline(
      input.id,
      input.newStatus,
      input.note,
      input.operatorId,
      input.isInternal,
    );

    return this.mapToResult(dispute);
  }

  private generateDisputeId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `DSP-${year}-${random}`;
  }

  private calculateSlaDeadline(type: DisputeType): Date {
    const now = new Date();
    let days = 7; // Default
    if (type === DisputeType.TYPO) days = 3;
    if (type === DisputeType.IDENTITY_MISMATCH) days = 5;

    now.setDate(now.getDate() + days);
    return now;
  }

  private async logTimeline(
    disputeId: string,
    status: DisputeStatus,
    note: string | null,
    operatorId: bigint | null,
    isInternal: boolean,
  ): Promise<void> {
    await this.disputeRepository.addTimelineEntry({
      disputeId,
      status,
      note,
      operatorId,
      isInternal,
    });
  }

  private mapToResult(
    dispute: Dispute,
    hideInternal: boolean = false,
  ): DisputeResult {
    const filteredTimeline = hideInternal
      ? dispute.timeline.filter((t) => !t.isInternal)
      : dispute.timeline;

    return new DisputeResult(
      dispute.id,
      dispute.status,
      dispute.type,
      dispute.requestId,
      dispute.requesterId.toString(),
      dispute.operatorId?.toString() ?? null,
      dispute.slaDeadline,
      dispute.isSlaPaused,
      filteredTimeline.map(
        (t) =>
          new TimelineEntryResult(
            t.id,
            t.status,
            t.note,
            t.operatorId?.toString() ?? null,
            t.isInternal,
            t.createdAt,
          ),
      ),
      dispute.createdAt,
      dispute.updatedAt,
    );
  }
}
