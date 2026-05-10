import { ApiProperty } from '@nestjs/swagger';
import { UploadFileResult } from '../../../domain/document/dto/upload-file.result';

/**
 * 파일 업로드 응답.
 *
 * 클라이언트는 `downloadUri` 만 들고 다니면 됨 — `fileKey` 는 향후 메타데이터 조회용 식별자.
 * 다운로드는 백엔드 프록시 경로(`/api/v1/documents/files/<key>`) — 버킷은 직접 노출되지 않는다.
 */
export class UploadFileRes {
    @ApiProperty({
        description: '버킷 내 객체 키. 향후 메타데이터 조회·삭제 API 식별자로 사용 가능.',
        example: 'documents/2026/05/9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c.pdf',
    })
    readonly fileKey: string;

    @ApiProperty({
        description: '업로드 시 클라이언트가 보낸 원본 파일 이름(경로 구분자/제어 문자 sanitize 적용).',
        example: 'tax-invoice.pdf',
    })
    readonly originalFileName: string;

    @ApiProperty({
        description: '저장된 객체의 Content-Type. 암호화 PDF 는 `application/pdf` 로 고정.',
        example: 'application/pdf',
    })
    readonly contentType: string;

    @ApiProperty({
        description: '저장된 객체 크기(byte). 암호화 PDF 는 원본보다 약간 커질 수 있다.',
        example: 38291,
    })
    readonly size: number;

    @ApiProperty({
        description:
            '백엔드 프록시 다운로드 URI — `/<documentCode>/files/<stage>` 형태. ' +
            '이 값을 그대로 `Authorization: Bearer …` 와 함께 GET 호출하면 R2 객체가 스트리밍된다.',
        example: '/api/v1/documents/9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c/files/DOCUMENT_ARRIVED',
    })
    readonly downloadUri: string;

    @ApiProperty({
        description: 'true 면 PDF open-password 가 걸려있어 다운로드 후 비밀번호 입력이 필요.',
        example: false,
    })
    readonly encrypted: boolean;

    @ApiProperty({
        description: '업로드 완료 시각 (ISO 8601, UTC).',
        example: '2026-05-10T05:21:00.000Z',
    })
    readonly uploadedAt: string;

    constructor(
        fileKey: string,
        originalFileName: string,
        contentType: string,
        size: number,
        downloadUri: string,
        encrypted: boolean,
        uploadedAt: string,
    ) {
        this.fileKey = fileKey;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.size = size;
        this.downloadUri = downloadUri;
        this.encrypted = encrypted;
        this.uploadedAt = uploadedAt;
    }

    static from(result: UploadFileResult): UploadFileRes {
        return new UploadFileRes(
            result.fileKey,
            result.originalFileName,
            result.contentType,
            result.size,
            result.downloadUri,
            result.encrypted,
            result.uploadedAt.toISOString(),
        );
    }
}
