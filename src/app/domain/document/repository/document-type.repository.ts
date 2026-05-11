import { PersonaType } from "../../common/enum/persona-type.enum";
import { DocumentTypeListItemResult } from "../dto/document-type-list-item.result";
import { DocumentType } from "../entity/document-type.entity";

export abstract class DocumentTypeRepository {
  /**
   * 코드로 카탈로그 1건 조회.
   * 활성(ACTIVE) 카탈로그만 반환 — DEPRECATED · 삭제 건은 null.
   * 호출 측은 "발급 가능한 카탈로그" 라는 가정으로 결과를 사용한다.
   */
  abstract findByCode(code: string): Promise<DocumentType | null>;

  /**
   * 발급 가능한 카탈로그 전체 조회 — 와이어프레임 "서류 발급 신청" 화면용.
   * Issuer 조인해서 한 번에 가져온다 (N+1 회피).
   *
   * personaType 미지정 시 전체 페르소나 반환, 지정 시 해당 페르소나용 카탈로그만.
   * 정렬: issuer.code ASC → documentType.code ASC (운영자가 등록한 순서 가깝게 안정 정렬).
   */
  abstract findAvailableList(
    personaType?: PersonaType,
  ): Promise<DocumentTypeListItemResult[]>;
}