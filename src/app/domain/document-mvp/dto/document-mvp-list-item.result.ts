import {
  DOCUMENT_MVP_STAGE_LABELS,
  DocumentMvpStage,
} from "../enum/document-mvp-stage.enum";
import {
  DOCUMENT_MVP_STATUS_LABELS,
  DocumentMvpStatus,
} from "../enum/document-mvp-status.enum";
import { toCurrentUiStep } from "./document-mvp-ui-step.result";

/**
 * history 페이지 리스트의 한 줄.
 *
 * FE 4단계 표시를 위해 `currentStep` / `currentStepLabel` / `totalSteps` 를 같이 내려준다.
 */
export class DocumentMvpListItemResult {
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
  ) {}

  get statusLabel(): string {
    return DOCUMENT_MVP_STATUS_LABELS[this.status];
  }

  get currentStageLabel(): string {
    return DOCUMENT_MVP_STAGE_LABELS[this.currentStage];
  }

  get currentUiStep(): { step: number; label: string; totalSteps: number } {
    return toCurrentUiStep(this.currentStage, this.status);
  }
}

export class DocumentMvpListResult {
  constructor(
    public readonly items: DocumentMvpListItemResult[],
    public readonly total: number,
  ) {}
}
