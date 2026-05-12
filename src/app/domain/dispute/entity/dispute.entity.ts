import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import { IssuePipelineStage } from "../../credential/enum/issue-pipeline-stage.enum";
import { DisputeStatus } from "../enum/dispute-status.enum";
import { DisputeType } from "../enum/dispute-type.enum";

export class TimelineEntry {
  constructor(
    public readonly id: string,
    public readonly status: DisputeStatus,
    public readonly note: string | null,
    public readonly operatorId: bigint | null,
    public readonly isInternal: boolean,
    public readonly createdAt: Date,
  ) {}
}

/**
 * 분쟁(Dispute) 엔티티.
 * 사용자가 발급된 크리덴셜에 대해 제기한 이의제기 및 그 처리 과정을 관리한다.
 */
export class Dispute {
  constructor(
    public readonly id: string, // DSP-YYYY-NNNN 형식
    private _status: DisputeStatus,
    public readonly type: DisputeType,
    public readonly targetStage: IssuePipelineStage, // 이의제기 대상 단계
    public readonly requestId: string, // 원본 발급 요청 ID (CredentialIssueRequest.issueRequestCode)
    public readonly requesterId: bigint, // 이의제기한 사용자 ID
    private _operatorId: bigint | null, // 담당 운영자 ID
    private _slaDeadline: Date,
    private _isSlaPaused: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    private readonly _timeline: TimelineEntry[] = [],
  ) {}

  get status(): DisputeStatus {
    return this._status;
  }

  get operatorId(): bigint | null {
    return this._operatorId;
  }

  get slaDeadline(): Date {
    return this._slaDeadline;
  }

  get isSlaPaused(): boolean {
    return this._isSlaPaused;
  }

  get timeline(): TimelineEntry[] {
    return [...this._timeline];
  }

  /**
   * 담당 운영자를 배정한다.
   */
  public assignOperator(operatorId: bigint): void {
    if (
      this._status !== DisputeStatus.RECEIVED &&
      this._status !== DisputeStatus.ASSIGNED
    ) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: "Only RECEIVED or ASSIGNED disputes can be (re)assigned.",
      });
    }
    this._operatorId = operatorId;
    this._status = DisputeStatus.ASSIGNED;
  }

  /**
   * 상태를 변경한다.
   */
  public changeStatus(
    newStatus: DisputeStatus,
    operatorId: bigint,
    note: string | null = null,
    isInternal: boolean = false,
  ): void {
    this.assertNotFinalized();

    // 상태 변경 규칙 검증 (ADR-003)
    // RECEIVED -> ASSIGNED -> IN_REVIEW -> (INFO_REQUESTED) -> RESOLVED/REJECTED

    this._status = newStatus;

    // SLA 일시정지 로직
    this._isSlaPaused = newStatus === DisputeStatus.INFO_REQUESTED;

    // 타임라인 추가 로직은 서비스 레이어에서 담당하거나, 엔티티에서 메서드로 제공 가능
  }

  /**
   * 최종 확정된 상태(RESOLVED, REJECTED)인지 확인한다.
   */
  private assertNotFinalized(): void {
    if (
      this._status === DisputeStatus.RESOLVED ||
      this._status === DisputeStatus.REJECTED
    ) {
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: "Finalized disputes cannot be modified.",
      });
    }
  }

  /**
   * 엔티티를 재생성할 때 타임라인을 추가한다.
   */
  public addTimelineEntry(entry: TimelineEntry): void {
    this._timeline.push(entry);
  }
}
