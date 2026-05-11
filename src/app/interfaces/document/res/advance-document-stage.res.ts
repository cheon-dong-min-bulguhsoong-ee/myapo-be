import { ApiProperty } from "@nestjs/swagger";
import { AdvanceDocumentStageResult } from "../../../domain/document/dto/advance-document-stage.result";
import { DocumentStage } from "../../../domain/document/enum/document-stage.enum";
import { DocumentStatus } from "../../../domain/document/enum/document-status.enum";

/**
 * 문서 단계 승인 + 전이 응답 Body.
 *
 * 한 호출에 (1) DocumentApproval INSERT 와 (2) documents.current_stage 갱신이
 * 함께 일어나므로, 응답에는 양쪽 스냅샷이 모두 들어간다.
 *
 * - `approvedStage` 와 `currentStage` 는 정상 흐름에선 같은 값.
 * - WALLET_STORED 도달 시에만 `status=VALID` 와 `issuedAt` 가 채워진다.
 */
export class AdvanceDocumentStageRes {
  @ApiProperty({
    description: "전이 처리된 문서의 외부 노출 코드 (UUID).",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode: string;

  @ApiProperty({
    enum: DocumentStage,
    description:
      "이 호출이 통과시킨 stage (DocumentApproval.stage 와 동일). " +
      "정상 흐름에선 currentStage 와 같다.",
    example: DocumentStage.DOCUMENT_ARRIVED,
  })
  readonly approvedStage: DocumentStage;

  @ApiProperty({
    enum: DocumentStage,
    description:
      "전이 후 currentStage. " +
      "AUTHORITY_ISSUED → DOCUMENT_ARRIVED → TRANSLATED_NOTARIZED → APOSTILLE_ISSUED → WALLET_STORED 순서로 1단계 전진.",
    example: DocumentStage.DOCUMENT_ARRIVED,
  })
  readonly currentStage: DocumentStage;

  @ApiProperty({
    enum: DocumentStatus,
    description:
      "전이 후 status. WALLET_STORED 도달 시 VALID, 그 외에는 AWAITING_APPROVAL 유지.",
    example: DocumentStatus.AWAITING_APPROVAL,
  })
  readonly status: DocumentStatus;

  @ApiProperty({
    description:
      "문서 발급 완료 시각 (ISO 8601, UTC). WALLET_STORED 도달 시점에만 채워진다.",
    nullable: true,
    example: null,
  })
  readonly issuedAt: string | null;

  @ApiProperty({
    description: "사용자가 서명한 XRPL 트랜잭션 해시 (64자 hex).",
    example: "A5111111111111111111111111111111111111111111111111111111111111AA",
  })
  readonly xrplTxHash: string;

  @ApiProperty({
    description: "사용자 승인(서명 컨펌) 시각 (ISO 8601, UTC).",
    example: "2026-05-06T03:00:00.000Z",
  })
  readonly approvedAt: string;

  constructor(
    documentCode: string,
    approvedStage: DocumentStage,
    currentStage: DocumentStage,
    status: DocumentStatus,
    issuedAt: string | null,
    xrplTxHash: string,
    approvedAt: string,
  ) {
    this.documentCode = documentCode;
    this.approvedStage = approvedStage;
    this.currentStage = currentStage;
    this.status = status;
    this.issuedAt = issuedAt;
    this.xrplTxHash = xrplTxHash;
    this.approvedAt = approvedAt;
  }

  static from(result: AdvanceDocumentStageResult): AdvanceDocumentStageRes {
    return new AdvanceDocumentStageRes(
      result.documentCode,
      result.approvedStage,
      result.currentStage,
      result.status,
      result.issuedAt === null ? null : result.issuedAt.toISOString(),
      result.xrplTxHash,
      result.approvedAt.toISOString(),
    );
  }
}
