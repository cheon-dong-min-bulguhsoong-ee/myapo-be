import {ApiProperty} from '@nestjs/swagger';
import {DocumentListResult} from '../../../domain/document/dto/document-list-item.result';
import {DocumentListItemRes} from './document-list-item.res';

/**
 * 문서 관리 리스트 응답 — items + 페이지네이션 메타.
 */
export class DocumentListRes {
    @ApiProperty({type: [DocumentListItemRes], description: '현재 페이지의 행 목록.'})
    readonly items!: DocumentListItemRes[];

    @ApiProperty({description: '필터 조건에 해당하는 전체 건수.', example: 142})
    readonly total!: number;

    @ApiProperty({description: '현재 페이지 번호 (1-based).', example: 1})
    readonly page!: number;

    @ApiProperty({description: '페이지 크기.', example: 20})
    readonly limit!: number;

    static from(r: DocumentListResult): DocumentListRes {
        return {
            items: r.items.map(DocumentListItemRes.from),
            total: r.total,
            page: r.page,
            limit: r.limit,
        };
    }
}
