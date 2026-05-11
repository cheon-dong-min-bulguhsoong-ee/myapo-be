import { ApiProperty } from "@nestjs/swagger";
import { AdvanceDocumentMvpResult } from "../../../domain/document-mvp/dto/advance-document-mvp.result";
import { toCurrentUiStep } from "../../../domain/document-mvp/dto/document-mvp-ui-step.result";
import {
  DOCUMENT_MVP_STAGE_LABELS,
  DocumentMvpStage,
} from "../../../domain/document-mvp/enum/document-mvp-stage.enum";
import {
  DOCUMENT_MVP_STATUS_LABELS,
  DocumentMvpStatus,
} from "../../../domain/document-mvp/enum/document-mvp-status.enum";

export class AdvanceDocumentMvpRes {
  @ApiProperty({
    description: "전이된 문서 코드 (UUID).",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode!: string;

  @ApiProperty({
    enum: DocumentMvpStage,
    description: "전이 후 current_stage.",
    example: DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED,
  })
  readonly currentStage!: DocumentMvpStage;

  @ApiProperty({
    description: "currentStage 한글 라벨.",
    example: "번역·공증 완료",
  })
  readonly currentStageLabel!: string;

  @ApiProperty({
    enum: DocumentMvpStatus,
    description:
      "전이 후 status. APOSTILLE_DOC_ISSUED 도달 시 VALID, 그 외에는 AWAITING_USER_APPROVAL 유지.",
    example: DocumentMvpStatus.AWAITING_USER_APPROVAL,
  })
  readonly status!: DocumentMvpStatus;

  @ApiProperty({ description: "status 한글 라벨.", example: "사용자 확인 대기" })
  readonly statusLabel!: string;

  @ApiProperty({
    description: "FE 4단계 중 현재 step (1~4).",
    example: 2,
  })
  readonly currentStep!: number;

  @ApiProperty({ description: "현재 step 한글 라벨.", example: "번역·공증" })
  readonly currentStepLabel!: string;

  @ApiProperty({ description: "전체 step 수 (= 4 고정).", example: 4 })
  readonly totalSteps!: number;

  @ApiProperty({
    description:
      "발급 완료 시각 (ISO 8601, UTC). APOSTILLE_DOC_ISSUED 도달 시점에만 채워진다.",
    nullable: true,
    example: null,
  })
  readonly issuedAt!: string | null;

  static from(r: AdvanceDocumentMvpResult): AdvanceDocumentMvpRes {
    const ui = toCurrentUiStep(r.currentStage, r.status);
    return {
      documentCode: r.documentCode,
      currentStage: r.currentStage,
      currentStageLabel: DOCUMENT_MVP_STAGE_LABELS[r.currentStage],
      status: r.status,
      statusLabel: DOCUMENT_MVP_STATUS_LABELS[r.status],
      currentStep: ui.step,
      currentStepLabel: ui.label,
      totalSteps: ui.totalSteps,
      issuedAt: r.issuedAt === null ? null : r.issuedAt.toISOString(),
    };
  }
}
