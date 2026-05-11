import { ApiProperty } from "@nestjs/swagger";
import { DocumentTypeListItemResult } from "../../../domain/document/dto/document-type-list-item.result";
import { DocumentTypeListItemRes } from "./document-type-list-item.res";

/**
 * 문서 카탈로그 리스트 응답.
 *
 * 페이지네이션 X — 카탈로그는 운영자가 관리하는 작은 마스터 데이터(<수십 건).
 * 와이어프레임처럼 한 화면에 스크롤로 다 보여주는 게 자연스럽다.
 */
export class DocumentTypeListRes {
  @ApiProperty({
    type: [DocumentTypeListItemRes],
    description: "발급 가능한 카탈로그 전체.",
  })
  readonly items!: DocumentTypeListItemRes[];

  @ApiProperty({ description: "총 건수 (`items.length` 와 동일).", example: 10 })
  readonly total!: number;

  static from(items: DocumentTypeListItemResult[]): DocumentTypeListRes {
    return {
      items: items.map(DocumentTypeListItemRes.from),
      total: items.length,
    };
  }
}