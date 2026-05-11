import { ApiProperty } from "@nestjs/swagger";
import {
  DocumentMvpDetailResult,
  DocumentMvpStageDetail,
} from "../../../domain/document-mvp/dto/document-mvp-detail.result";
import { DocumentMvpUiStepResult } from "../../../domain/document-mvp/dto/document-mvp-ui-step.result";
import { DocumentMvpStageStatus } from "../../../domain/document-mvp/enum/document-mvp-stage-status.enum";
import { DocumentMvpStage } from "../../../domain/document-mvp/enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../../../domain/document-mvp/enum/document-mvp-status.enum";

/**
 * 내부 5단계 raw stage 의 한 줄.
 */
export class DocumentMvpStageDetailRes {
  @ApiProperty({ enum: DocumentMvpStage })
  readonly stage!: DocumentMvpStage;

  @ApiProperty({ description: "stage 한글 라벨.", example: "번역·공증 접수" })
  readonly stageLabel!: string;

  @ApiProperty({
    enum: DocumentMvpStageStatus,
    nullable: true,
    description: "미시작 시 null.",
  })
  readonly status!: DocumentMvpStageStatus | null;

  @ApiProperty({
    description: "status 한글 라벨. 미시작 시 null.",
    nullable: true,
    example: "진행 중",
  })
  readonly statusLabel!: string | null;

  @ApiProperty({ nullable: true })
  readonly startedAt!: string | null;

  @ApiProperty({ nullable: true })
  readonly completedAt!: string | null;

  @ApiProperty({ nullable: true })
  readonly failureReason!: string | null;

  static from(d: DocumentMvpStageDetail): DocumentMvpStageDetailRes {
    return {
      stage: d.stage,
      stageLabel: d.stageLabel,
      status: d.status,
      statusLabel: d.statusLabel,
      startedAt: d.startedAt?.toISOString() ?? null,
      completedAt: d.completedAt?.toISOString() ?? null,
      failureReason: d.failureReason,
    };
  }
}

/**
 * FE 4단계 step 한 줄.
 */
export class DocumentMvpUiStepRes {
  @ApiProperty({ description: "1~4.", example: 2 })
  readonly step!: number;

  @ApiProperty({ description: "step 한글 라벨.", example: "번역·공증" })
  readonly label!: string;

  @ApiProperty({
    enum: DocumentMvpStageStatus,
    nullable: true,
    description: "PENDING(진행 중) / DONE(완료) / FAILED(실패) / null(미시작).",
  })
  readonly status!: DocumentMvpStageStatus | null;

  @ApiProperty({
    description: "status 한글 라벨. 미시작 시 null.",
    nullable: true,
    example: "진행 중",
  })
  readonly statusLabel!: string | null;

  @ApiProperty({ nullable: true })
  readonly startedAt!: string | null;

  @ApiProperty({ nullable: true })
  readonly completedAt!: string | null;

  static from(s: DocumentMvpUiStepResult): DocumentMvpUiStepRes {
    return {
      step: s.step,
      label: s.label,
      status: s.status,
      statusLabel: s.statusLabel,
      startedAt: s.startedAt?.toISOString() ?? null,
      completedAt: s.completedAt?.toISOString() ?? null,
    };
  }
}

/**
 * history/app-1 화면용 상세 응답.
 */
export class DocumentMvpDetailRes {
  @ApiProperty({ description: "문서 외부 코드 (UUID)." })
  readonly documentCode!: string;

  @ApiProperty()
  readonly documentTypeCode!: string;

  @ApiProperty({ description: "문서 카탈로그 표시명.", example: "납세증명서 (영문)" })
  readonly documentTypeName!: string;

  @ApiProperty({ description: "발급기관 표시명.", example: "국세청" })
  readonly issuerName!: string;

  @ApiProperty({ description: "발급기관 아이콘 라벨.", example: "NTS" })
  readonly issuerIconLabel!: string;

  @ApiProperty({ description: "발급기관 국가 (ISO 3166-1 alpha-2).", example: "KR" })
  readonly issuerCountryCode!: string;

  @ApiProperty({ enum: DocumentMvpStatus })
  readonly status!: DocumentMvpStatus;

  @ApiProperty({ description: "status 한글 라벨.", example: "사용자 확인 대기" })
  readonly statusLabel!: string;

  @ApiProperty({ enum: DocumentMvpStage })
  readonly currentStage!: DocumentMvpStage;

  @ApiProperty({
    description: "currentStage 한글 라벨.",
    example: "번역·공증 접수",
  })
  readonly currentStageLabel!: string;

  @ApiProperty()
  readonly requestedAt!: string;

  @ApiProperty({ nullable: true })
  readonly issuedAt!: string | null;

  @ApiProperty({
    type: [DocumentMvpUiStepRes],
    description:
      "FE 4단계 step. 발급 신청 / 번역·공증 / 아포스티유 / 발급 완료 4개 고정.",
  })
  readonly uiSteps!: DocumentMvpUiStepRes[];

  @ApiProperty({
    type: [DocumentMvpStageDetailRes],
    description: "내부 5 raw stage 스냅샷 (감사/디버깅용).",
  })
  readonly stages!: DocumentMvpStageDetailRes[];

  static from(r: DocumentMvpDetailResult): DocumentMvpDetailRes {
    return {
      documentCode: r.documentCode,
      documentTypeCode: r.documentTypeCode,
      documentTypeName: r.documentTypeName,
      issuerName: r.issuerName,
      issuerIconLabel: r.issuerIconLabel,
      issuerCountryCode: r.issuerCountryCode,
      status: r.status,
      statusLabel: r.statusLabel,
      currentStage: r.currentStage,
      currentStageLabel: r.currentStageLabel,
      requestedAt: r.requestedAt.toISOString(),
      issuedAt: r.issuedAt?.toISOString() ?? null,
      uiSteps: r.uiSteps.map(DocumentMvpUiStepRes.from),
      stages: r.stages.map(DocumentMvpStageDetailRes.from),
    };
  }
}
