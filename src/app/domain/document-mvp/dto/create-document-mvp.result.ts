import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";

/**
 * 발급 신청 결과.
 *
 * Mock 흐름상 신청 시점에 stage 1(USER_DOC_REQUESTED), stage 2(AUTHORITY_DOC_ISSUED) 이
 * 자동으로 DONE 처리되고, currentStage 는 stage 3 (TRANSLATOR_DOC_RECEIVED) 으로 시작한다.
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
