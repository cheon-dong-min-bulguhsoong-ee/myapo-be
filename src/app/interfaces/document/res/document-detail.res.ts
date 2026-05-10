import { ApiProperty } from "@nestjs/swagger";
import {
  DocumentApprovalDetailResult,
  DocumentDetailResult,
  DocumentStageDetailResult,
  DocumentSubstep,
} from "../../../domain/document/dto/document-detail.result";
import { DocumentStage } from "../../../domain/document/enum/document-stage.enum";
import { DocumentStageStatus } from "../../../domain/document/enum/document-stage-status.enum";
import { DocumentStatus } from "../../../domain/document/enum/document-status.enum";

/**
 * 5단계 중 1단계 이벤트.
 * `status === null` → DocumentStage 행이 아직 없음 = "미시작".
 */
export class DocumentStageDetailRes {
  @ApiProperty({ enum: DocumentStage, description: "단계 식별자." })
  readonly stage!: DocumentStage;

  @ApiProperty({
    enum: DocumentStageStatus,
    nullable: true,
    description:
      "단계 진행 상태. null = 아직 시작 안 됨 (DocumentStage 이벤트 행 없음).",
  })
  readonly status!: DocumentStageStatus | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: "단계 시작 시각 (ISO 8601, UTC).",
  })
  readonly startedAt!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: "단계 완료 시각 (ISO 8601, UTC).",
  })
  readonly completedAt!: string | null;

  @ApiProperty({ type: String, nullable: true, description: "단계 실패 사유." })
  readonly failureReason!: string | null;

  static from(r: DocumentStageDetailResult): DocumentStageDetailRes {
    return {
      stage: r.stage,
      status: r.status,
      startedAt: r.startedAt?.toISOString() ?? null,
      completedAt: r.completedAt?.toISOString() ?? null,
      failureReason: r.failureReason,
    };
  }
}

/**
 * 사용자 승인 1건. stage = 이 승인이 통과시킨 "다음" stage.
 */
export class DocumentApprovalDetailRes {
  @ApiProperty({
    enum: DocumentStage,
    description: "이 승인이 통과시킨 다음 stage.",
  })
  readonly stage!: DocumentStage;

  @ApiProperty({
    description: "XRPL 트랜잭션 해시.",
    example: "A5111111111111111111111111111111111111111111111111111111111111AA",
  })
  readonly xrplTxHash!: string;

  @ApiProperty({
    description: "서명 컨펌 시각 (ISO 8601, UTC).",
    example: "2026-05-06T03:00:00.000Z",
  })
  readonly approvedAt!: string;

  static from(r: DocumentApprovalDetailResult): DocumentApprovalDetailRes {
    return {
      stage: r.stage,
      xrplTxHash: r.xrplTxHash,
      approvedAt: r.approvedAt.toISOString(),
    };
  }
}

/**
 * 문서 관리 행 펼침 시 표시할 상세 — 리스트 8컬럼 + 5단계 파이프라인 + 4번의 사용자 승인 누적.
 *
 * `currentSubstep` 은 와이어프레임 connector 의 substep(`크리덴셜 생성` / `사용자 승인`) 진행 위치.
 * 종착(`WALLET_STORED`) / 실패 / 만료 / 폐기 등 더 이상 substep 없을 땐 null.
 */
export class DocumentDetailRes {
  @ApiProperty({
    description: "발급 문서 외부 코드.",
    example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  })
  readonly documentCode!: string;

  @ApiProperty({
    description: "내부 회원 식별자 (User.id 문자열).",
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

  @ApiProperty({ description: "문서 카탈로그 표시명.", example: "납세증명서" })
  readonly documentTypeName!: string;

  @ApiProperty({ description: "발급기관 국가 코드.", example: "KR" })
  readonly countryCode!: string;

  @ApiProperty({
    description: "발급 요청 시각 (ISO 8601, UTC).",
    example: "2026-05-06T03:00:00.000Z",
  })
  readonly requestedAt!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: "발급 완료 시각 (WALLET_STORED 도달 시점).",
  })
  readonly issuedAt!: string | null;

  @ApiProperty({ enum: DocumentStatus, description: "문서 상태." })
  readonly status!: DocumentStatus;

  @ApiProperty({ enum: DocumentStage, description: "현재 stage." })
  readonly currentStage!: DocumentStage;

  @ApiProperty({
    enum: ["CREDENTIAL_GENERATING", "AWAITING_USER_APPROVAL"],
    nullable: true,
    description:
      "진행 중인 sub-step. " +
      "CREDENTIAL_GENERATING = 서버가 다음 stage 크리덴셜 준비 중 / " +
      "AWAITING_USER_APPROVAL = 사용자 서명 대기 / " +
      "null = sub-step 진행 없음 (terminal 또는 stage 막 전이된 직후).",
  })
  readonly currentSubstep!: DocumentSubstep | null;

  @ApiProperty({
    type: [DocumentStageDetailRes],
    description:
      "5개 stage 의 이벤트 스냅샷 (AUTHORITY_ISSUED 부터 WALLET_STORED 순서로 항상 5건). " +
      "status=null 인 항목은 아직 시작되지 않은 단계.",
  })
  readonly stages!: DocumentStageDetailRes[];

  @ApiProperty({
    type: [DocumentApprovalDetailRes],
    description:
      "사용자 승인 누적 (최대 4건). 여기에 stage=X 인 행이 있다면 " +
      '"X 단계로의 전이를 사용자가 승인 완료" 라는 의미.',
  })
  readonly approvals!: DocumentApprovalDetailRes[];

  static from(r: DocumentDetailResult): DocumentDetailRes {
    return {
      documentCode: r.documentCode,
      memberCode: r.memberCode,
      requesterName: r.requesterName,
      requesterEmail: r.requesterEmail,
      documentTypeCode: r.documentTypeCode,
      documentTypeName: r.documentTypeName,
      countryCode: r.countryCode,
      requestedAt: r.requestedAt.toISOString(),
      issuedAt: r.issuedAt?.toISOString() ?? null,
      status: r.status,
      currentStage: r.currentStage,
      currentSubstep: r.currentSubstep,
      stages: r.stages.map(DocumentStageDetailRes.from),
      approvals: r.approvals.map(DocumentApprovalDetailRes.from),
    };
  }
}
