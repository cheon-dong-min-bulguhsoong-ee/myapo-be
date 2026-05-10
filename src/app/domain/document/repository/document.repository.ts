import { DocumentDetailResult } from "../dto/document-detail.result";
import { DocumentListItemResult } from "../dto/document-list-item.result";
import { Document } from "../entity/document.entity";
import { DocumentStage } from "../enum/document-stage.enum";
import { DocumentStatus } from "../enum/document-status.enum";

export interface CreateDocumentInput {
  documentCode: string;
  userId: bigint;
  documentTypeCode: string;
  status: DocumentStatus;
  currentStage: DocumentStage;
  requestedAt: Date;
}

export interface UpdateDocumentStageInput {
  currentStage: DocumentStage;
  status: DocumentStatus;
  issuedAt: Date | null;
}

/**
 * 문서 관리 리스트 조회 옵션. 모두 optional — q 는 documentCode/이름/이메일 부분일치.
 * page 는 1-based.
 */
export interface FindDocumentListInput {
  status?: DocumentStatus;
  documentTypeCode?: string;
  countryCode?: string;
  q?: string;
  page: number;
  limit: number;
}

export interface DocumentListPage {
  items: DocumentListItemResult[];
  total: number;
}

export abstract class DocumentRepository {
  abstract create(input: CreateDocumentInput): Promise<Document>;

  abstract findByCode(documentCode: string): Promise<Document | null>;

  abstract updateStage(
    documentId: bigint,
    input: UpdateDocumentStageInput,
  ): Promise<Document>;

  /**
   * 문서 관리 페이지의 리스트 + 총 건수.
   * User · DocumentType · Issuer 조인해서 한 번에 가져온다 (N+1 회피).
   */
  abstract findList(input: FindDocumentListInput): Promise<DocumentListPage>;

  /**
   * documentCode 로 상세를 조회한다 — User · DocumentType · Issuer · 5단계 stages · approvals 포함.
   * `currentSubstep` 은 service 에서 계산하므로 여기서는 항상 null 로 채운다.
   */
  abstract findDetailByCode(
    documentCode: string,
  ): Promise<DocumentDetailResult | null>;
}
