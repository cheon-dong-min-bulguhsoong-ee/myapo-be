import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";

/**
 * 단계 전이 결과.
 *
 * - currentStage: 전이 후 stage. APOSTILLE_DOC_ISSUED 도달 시 status=VALID, issuedAt 채워짐.
 */
export class AdvanceDocumentMvpResult {
  constructor(
    public readonly documentCode: string,
    public readonly currentStage: DocumentMvpStage,
    public readonly status: DocumentMvpStatus,
    public readonly issuedAt: Date | null,
  ) {}
}
