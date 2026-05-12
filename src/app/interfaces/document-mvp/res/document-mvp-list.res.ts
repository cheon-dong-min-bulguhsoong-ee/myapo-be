import { ApiProperty } from "@nestjs/swagger";
import {
  DocumentMvpListItemResult,
  DocumentMvpListResult,
} from "../../../domain/document-mvp/dto/document-mvp-list-item.result";
import { DocumentMvpStage } from "../../../domain/document-mvp/enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../../../domain/document-mvp/enum/document-mvp-status.enum";

export class DocumentMvpListItemRes {
  @ApiProperty()
  readonly documentCode!: string;

  @ApiProperty()
  readonly documentTypeCode!: string;

  @ApiProperty()
  readonly documentTypeName!: string;

  @ApiProperty()
  readonly issuerName!: string;

  @ApiProperty()
  readonly issuerIconLabel!: string;

  @ApiProperty()
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

  @ApiProperty({
    description: "FE 4단계 중 현재 step (1~4).",
    example: 2,
  })
  readonly currentStep!: number;

  @ApiProperty({
    description: "현재 step 한글 라벨.",
    example: "번역·공증",
  })
  readonly currentStepLabel!: string;

  @ApiProperty({ description: "전체 step 수 (= 4 고정).", example: 4 })
  readonly totalSteps!: number;

  @ApiProperty()
  readonly requestedAt!: string;

  @ApiProperty({ nullable: true })
  readonly issuedAt!: string | null;

  @ApiProperty({
    description: "발급 완료 여부 (status === VALID).",
    example: false,
  })
  readonly isSuccess!: boolean;

  static from(r: DocumentMvpListItemResult): DocumentMvpListItemRes {
    const ui = r.currentUiStep;
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
      currentStep: ui.step,
      currentStepLabel: ui.label,
      totalSteps: ui.totalSteps,
      requestedAt: r.requestedAt.toISOString(),
      issuedAt: r.issuedAt?.toISOString() ?? null,
      isSuccess: r.isSuccess,
    };
  }
}

/**
 * history 페이지 리스트 응답.
 */
export class DocumentMvpListRes {
  @ApiProperty({ type: [DocumentMvpListItemRes] })
  readonly items!: DocumentMvpListItemRes[];

  @ApiProperty()
  readonly total!: number;

  static from(r: DocumentMvpListResult): DocumentMvpListRes {
    return {
      items: r.items.map(DocumentMvpListItemRes.from),
      total: r.total,
    };
  }
}
