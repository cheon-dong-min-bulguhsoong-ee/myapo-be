import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";

/**
 * 발급 신청 결과.
 *
 * Mock 흐름상 신청 시점에 stage 1(AUTHORITY_DOC_ISSUED) 이 PENDING 으로 시드되어
 * currentStage 가 AUTHORITY_DOC_ISSUED 로 시작하고, status 는 AWAITING_USER_APPROVAL.
 */
export class CreateDocumentMvpResult {
  constructor(
    public readonly documentCode: string,
    public readonly documentTypeCode: string,
    public readonly status: DocumentMvpStatus,
    public readonly currentStage: DocumentMvpStage,
    public readonly requestedAt: Date,
  ) {}
}
