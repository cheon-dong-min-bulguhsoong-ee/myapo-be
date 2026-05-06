import { DocumentType } from '../entity/document-type.entity';

export abstract class DocumentTypeRepository {
  /**
   * 코드로 카탈로그 1건 조회.
   * 활성(ACTIVE) 카탈로그만 반환 — DEPRECATED · 삭제 건은 null.
   * 호출 측은 "발급 가능한 카탈로그" 라는 가정으로 결과를 사용한다.
   */
  abstract findByCode(code: string): Promise<DocumentType | null>;
}
