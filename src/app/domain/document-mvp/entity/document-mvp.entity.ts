import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";

/**
 * MVP 도메인 의 문서 엔티티 — 기존 `documents` 테이블을 그대로 활용하되,
 * 의미상 새 enum 셋 (`DocumentMvpStage` / `DocumentMvpStatus`) 으로 해석한다.
 *
 * NestJS prisma 의 Document row 와 1:1 — XRPL/배포 관련 컬럼은 MVP 흐름에서 사용하지 않으므로
 * 엔티티에서도 단순화해서 핵심 필드만 노출.
 */
export class DocumentMvp {
  constructor(
    public readonly id: bigint,
    public readonly documentCode: string,
    public readonly userId: bigint,
    public readonly documentTypeCode: string,
    public readonly status: DocumentMvpStatus,
    public readonly currentStage: DocumentMvpStage,
    public readonly failureReason: string | null,
    public readonly requestedAt: Date,
    public readonly issuedAt: Date | null,
  ) {}
}
