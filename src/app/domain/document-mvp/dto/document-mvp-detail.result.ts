import {
  DOCUMENT_MVP_STAGE_STATUS_LABELS,
  DocumentMvpStageStatus,
} from "../enum/document-mvp-stage-status.enum";
import {
  DOCUMENT_MVP_STAGE_LABELS,
  DocumentMvpStage,
} from "../enum/document-mvp-stage.enum";
import {
  DOCUMENT_MVP_STATUS_LABELS,
  DocumentMvpStatus,
} from "../enum/document-mvp-status.enum";
import { DocumentMvpUiStepResult } from "./document-mvp-ui-step.result";

/**
 * 5개 raw stage 의 이벤트 스냅샷. 미시작 단계는 status=null.
 *
 * stageLabel / statusLabel 은 FE 가 그대로 표시할 수 있는 한글 라벨.
 */
export class DocumentMvpStageDetail {
  constructor(
    public readonly stage: DocumentMvpStage,
    public readonly status: DocumentMvpStageStatus | null,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly failureReason: string | null,
  ) {}

  get stageLabel(): string {
    return DOCUMENT_MVP_STAGE_LABELS[this.stage];
  }

  get statusLabel(): string | null {
    return this.status === null
      ? null
      : DOCUMENT_MVP_STAGE_STATUS_LABELS[this.status];
  }
}

/**
 * history/app-1 화면용 상세 — 한 문서의 전체 진행 상황.
 *
 * - `uiSteps`: FE 4단계 (발급 신청 / 번역·공증 / 아포스티유 / 발급 완료) 로 묶은 step.
 * - `stages`: 내부 5단계 raw 데이터 (디버깅/감사용).
 */
export class DocumentMvpDetailResult {
  constructor(
    public readonly documentCode: string,
    public readonly documentTypeCode: string,
    public readonly documentTypeName: string,
    public readonly issuerName: string,
    public readonly issuerIconLabel: string,
    public readonly issuerCountryCode: string,
    public readonly status: DocumentMvpStatus,
    public readonly currentStage: DocumentMvpStage,
    public readonly requestedAt: Date,
    public readonly issuedAt: Date | null,
    public readonly stages: DocumentMvpStageDetail[],
    public readonly uiSteps: DocumentMvpUiStepResult[],
  ) {}

  get statusLabel(): string {
    return DOCUMENT_MVP_STATUS_LABELS[this.status];
  }

  get currentStageLabel(): string {
    return DOCUMENT_MVP_STAGE_LABELS[this.currentStage];
  }

  get isSuccess(): boolean {
    return this.status === DocumentMvpStatus.VALID;
  }
}
