import { ApiProperty } from "@nestjs/swagger";
import { CreateDocumentResult } from "../../../domain/document/dto/create-document.result";
import { DocumentStage } from "../../../domain/document/enum/document-stage.enum";
import { DocumentStatus } from "../../../domain/document/enum/document-status.enum";

/**
 * 문서 발급 신청 응답 Body.
 *
 * 신규 생성된 Document 의 외부 식별자(UUID) 와 초기 상태를 클라이언트에 알려준다.
 * 클라이언트는 이 documentCode 로 이후 상세 조회·SSE 구독을 한다.
 *
 * id (BIGSERIAL) 노출 금지 — 외부에는 documentCode 만.
 */
export class CreateDocumentRes {
  @ApiProperty({
    description:
      "발급 문서 외부 노출 코드 (UUID). 이후 상세 조회·SSE 키로 사용",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode: string;

  @ApiProperty({
    description: "신청한 문서 카탈로그 코드",
    example: "KR-NTS-TAX-PAYMENT",
  })
  readonly documentTypeCode: string;

  @ApiProperty({
    enum: DocumentStatus,
    description: "신규 생성 직후이므로 항상 PROGRESS",
    example: DocumentStatus.PROGRESS,
  })
  readonly status: DocumentStatus;

  @ApiProperty({
    enum: DocumentStage,
    description: "신규 생성 직후이므로 항상 AUTHORITY_ISSUED",
    example: DocumentStage.AUTHORITY_ISSUED,
  })
  readonly currentStage: DocumentStage;

  @ApiProperty({
    description: "발급 요청 시각 (ISO 8601, UTC)",
    example: "2026-05-06T03:00:00.000Z",
  })
  readonly requestedAt: string;

  constructor(
    documentCode: string,
    documentTypeCode: string,
    status: DocumentStatus,
    currentStage: DocumentStage,
    requestedAt: string,
  ) {
    this.documentCode = documentCode;
    this.documentTypeCode = documentTypeCode;
    this.status = status;
    this.currentStage = currentStage;
    this.requestedAt = requestedAt;
  }

  /** 도메인 Result → 응답 DTO 매핑. Date 는 ISO 문자열로 직렬화. */
  static from(result: CreateDocumentResult): CreateDocumentRes {
    return new CreateDocumentRes(
      result.documentCode,
      result.documentTypeCode,
      result.status,
      result.currentStage,
      result.requestedAt.toISOString(),
    );
  }
}
