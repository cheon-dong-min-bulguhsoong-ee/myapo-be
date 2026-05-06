import { DocumentStage } from '../enum/document-stage.enum';
import { DocumentStatus } from '../enum/document-status.enum';

/**
 * 문서 발급 신청 결과.
 *
 * - 신규 생성된 Document 의 외부 노출 코드(UUID) 와 초기 상태 스냅샷.
 * - id (BIGSERIAL) 은 외부에 노출하지 않는다 — documentCode (UUID) 만 사용.
 * - 인터페이스 레이어 Res DTO 가 이 객체를 받아 HTTP 응답으로 매핑한다.
 */
export class CreateDocumentResult {
  constructor(
    public readonly documentCode: string,
    public readonly documentTypeCode: string,
    public readonly status: DocumentStatus,
    public readonly currentStage: DocumentStage,
    public readonly requestedAt: Date,
  ) {}
}
