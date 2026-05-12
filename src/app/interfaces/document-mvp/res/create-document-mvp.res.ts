import { ApiProperty } from "@nestjs/swagger";
import { CreateDocumentMvpResult } from "../../../domain/document-mvp/dto/create-document-mvp.result";
import { toCurrentUiStep } from "../../../domain/document-mvp/dto/document-mvp-ui-step.result";
import {
  DOCUMENT_MVP_STAGE_LABELS,
  DocumentMvpStage,
} from "../../../domain/document-mvp/enum/document-mvp-stage.enum";
import {
  DOCUMENT_MVP_STATUS_LABELS,
  DocumentMvpStatus,
} from "../../../domain/document-mvp/enum/document-mvp-status.enum";

export class CreateDocumentMvpRes {
  @ApiProperty({
    description: "발급 신청한 문서의 외부 노출 코드 (UUID).",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode!: string;

  @ApiProperty({
    description: "문서 카탈로그 코드.",
    example: "KR-NTS-TAX-PAYMENT",
  })
  readonly documentTypeCode!: string;

  @ApiProperty({
    enum: DocumentMvpStatus,
    description:
      "초기 상태. Mock 흐름에서 stage 1 (USER_DOC_REQUESTED) PENDING 상태로 시작하며 AWAITING_USER_APPROVAL.",
    example: DocumentMvpStatus.AWAITING_USER_APPROVAL,
  })
  readonly status!: DocumentMvpStatus;

  @ApiProperty({ description: "status 한글 라벨.", example: "사용자 확인 대기" })
  readonly statusLabel!: string;

  @ApiProperty({
    enum: DocumentMvpStage,
    description:
      "신청 직후 current_stage. Mock 흐름에서 stage 1 (USER_DOC_REQUESTED) 부터 시작.",
    example: DocumentMvpStage.USER_DOC_REQUESTED,
  })
  readonly currentStage!: DocumentMvpStage;

  @ApiProperty({
    description: "currentStage 한글 라벨.",
    example: "발급 신청",
  })
  readonly currentStageLabel!: string;

  @ApiProperty({
    description: "FE 4단계 중 현재 step (1~4).",
    example: 1,
  })
  readonly currentStep!: number;

  @ApiProperty({ description: "현재 step 한글 라벨.", example: "발급 신청" })
  readonly currentStepLabel!: string;

  @ApiProperty({ description: "전체 step 수 (= 4 고정).", example: 4 })
  readonly totalSteps!: number;

  @ApiProperty({
    description: "발급 신청 시각 (ISO 8601, UTC).",
    example: "2026-05-12T03:00:00.000Z",
  })
  readonly requestedAt!: string;

  static from(r: CreateDocumentMvpResult): CreateDocumentMvpRes {
    const ui = toCurrentUiStep(r.currentStage, r.status);
    return {
      documentCode: r.documentCode,
      documentTypeCode: r.documentTypeCode,
      status: r.status,
      statusLabel: DOCUMENT_MVP_STATUS_LABELS[r.status],
      currentStage: r.currentStage,
      currentStageLabel: DOCUMENT_MVP_STAGE_LABELS[r.currentStage],
      currentStep: ui.step,
      currentStepLabel: ui.label,
      totalSteps: ui.totalSteps,
      requestedAt: r.requestedAt.toISOString(),
    };
  }
}
