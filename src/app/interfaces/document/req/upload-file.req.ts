import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DocumentStage } from '../../../domain/document/enum/document-stage.enum';

/**
 * 일반 파일 업로드 요청.
 *
 * `multipart/form-data` 의 `file` 필드 옆에 `stage` 텍스트 필드가 함께 전송된다.
 * userPk 는 JWT 에서 추출되므로 클라이언트가 보낼 필요 없음.
 */
export class UploadFileReq {
    @ApiProperty({
        enum: DocumentStage,
        description: '이 파일이 속하는 5단계 파이프라인의 stage. 객체 키 prefix 로 사용.',
        example: DocumentStage.DOCUMENT_ARRIVED,
    })
    @IsEnum(DocumentStage)
    readonly stage!: DocumentStage;
}
