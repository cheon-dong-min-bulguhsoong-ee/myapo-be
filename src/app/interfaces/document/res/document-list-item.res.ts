import { ApiProperty } from "@nestjs/swagger";
import { DocumentListItemResult } from "../../../domain/document/dto/document-list-item.result";
import { DocumentStage } from "../../../domain/document/enum/document-stage.enum";
import { DocumentStatus } from "../../../domain/document/enum/document-status.enum";

/**
 * 문서 관리 리스트 1행. 와이어프레임 `DOC_TABS.progress.head` 와 1:1 매핑.
 *
 * 컬럼 ↔ 필드:
 *   요청번호      — documentCode
 *   회원번호      — memberCode
 *   요청자        — requesterName
 *   이메일        — requesterEmail
 *   문서 유형     — documentTypeName  (코드는 documentTypeCode)
 *   국가          — countryCode
 *   요청 시각     — requestedAt
 *   상태          — status            (currentStage 도 함께 줘서 진행 중 배지 라벨링 가능)
 */
export class DocumentListItemRes {
  @ApiProperty({
    description: '발급 문서 외부 코드 (UUID). 와이어프레임 컬럼 "요청번호".',
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode!: string;

  @ApiProperty({
    description:
      '요청한 사용자의 내부 회원 식별자 (User.id 문자열). 와이어프레임 컬럼 "회원번호".',
    example: "1",
  })
  readonly memberCode!: string;

  @ApiProperty({ description: "요청자 이름.", example: "홍길동" })
  readonly requesterName!: string;

  @ApiProperty({ description: "요청자 이메일.", example: "hong@example.com" })
  readonly requesterEmail!: string;

  @ApiProperty({
    description: "문서 카탈로그 코드.",
    example: "KR-NTS-TAX-PAYMENT",
  })
  readonly documentTypeCode!: string;

  @ApiProperty({
    description: "문서 카탈로그 표시명 (한국어).",
    example: "납세증명서",
  })
  readonly documentTypeName!: string;

  @ApiProperty({
    description: "발급기관 국가 코드 (ISO 3166-1 alpha-2).",
    example: "KR",
  })
  readonly countryCode!: string;

  @ApiProperty({
    description: "발급 요청 시각 (ISO 8601, UTC).",
    example: "2026-05-06T03:00:00.000Z",
  })
  readonly requestedAt!: string;

  @ApiProperty({
    enum: DocumentStatus,
    description: "문서 상태.",
    example: DocumentStatus.AWAITING_APPROVAL,
  })
  readonly status!: DocumentStatus;

  @ApiProperty({
    enum: DocumentStage,
    description: "현재 stage.",
    example: DocumentStage.AUTHORITY_ISSUED,
  })
  readonly currentStage!: DocumentStage;

  static from(r: DocumentListItemResult): DocumentListItemRes {
    return {
      documentCode: r.documentCode,
      memberCode: r.memberCode,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      documentTypeCode: r.documentTypeCode,
      documentTypeName: r.documentTypeName,
      countryCode: r.countryCode,
      requestedAt: r.requestedAt.toISOString(),
      status: r.status,
      currentStage: r.currentStage,
    };
  }
}
