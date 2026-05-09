import {Injectable} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {Readable} from 'stream';
import {DomainError} from '../../common/error/domain.error';
import {ErrorCode} from '../../common/error/error-code';
import {FileStorage} from '../contract/file-storage';
import {PdfEncryptor} from '../contract/pdf-encryptor';
import {UploadFileResult} from '../dto/upload-file.result';

/**
 * 문서 첨부 파일 도메인 서비스.
 *
 * - 일반 업로드: 임의 바이너리를 R2 에 그대로 저장.
 * - 암호화 업로드: PDF 만 받아 user/owner 패스워드를 걸어 R2 에 저장.
 *
 * 다운로드는 백엔드 프록시 형태 — 버킷은 private 유지, 외부에는 프록시 URI 만 노출.
 */
@Injectable()
export class DocumentFileService {
    /** 50 MiB. 도메인 정책으로 못 박는다 — multer 도 이 값으로 게이트. */
    static readonly MAX_FILE_BYTES = 50 * 1024 * 1024;

    /** 모든 업로드 객체는 이 prefix 아래에 저장. 다른 도메인이 같은 버킷을 써도 충돌 안 나게. */
    private static readonly KEY_PREFIX = 'documents';

    private static readonly PDF_CONTENT_TYPE = 'application/pdf';

    constructor(
        private readonly fileStorage: FileStorage,
        private readonly pdfEncryptor: PdfEncryptor,
    ) {
    }

    async uploadPlain(input: UploadPlainInput): Promise<UploadFileResult> {
        this.assertFileExists(input);

        const safeOriginalName = this.sanitizeOriginalName(input.originalFileName);
        const key = this.buildObjectKey(safeOriginalName);

        const stored = await this.fileStorage.upload({
            key,
            body: input.body,
            contentType: input.contentType,
            contentDisposition: this.toContentDisposition(safeOriginalName),
            metadata: {'original-filename': encodeURIComponent(safeOriginalName)},
        });

        return new UploadFileResult(
            stored.key,
            safeOriginalName,
            stored.contentType,
            stored.size,
            this.buildDownloadUri(stored.key),
            false,
            new Date(),
        );
    }

    async uploadEncryptedPdf(input: UploadEncryptedPdfInput): Promise<UploadFileResult> {
        this.assertFileExists(input);
        this.assertPdf(input);
        this.assertPassword(input.userPassword);

        const safeOriginalName = this.sanitizeOriginalName(input.originalFileName);
        const encryptedBuffer = await this.pdfEncryptor.protectWithPassword({
            source: input.body,
            userPassword: input.userPassword,
        });

        const key = this.buildObjectKey(safeOriginalName);
        const stored = await this.fileStorage.upload({
            key,
            body: encryptedBuffer,
            contentType: DocumentFileService.PDF_CONTENT_TYPE,
            contentDisposition: this.toContentDisposition(safeOriginalName),
            metadata: {
                'original-filename': encodeURIComponent(safeOriginalName),
                encryption: 'pdf-password',
            },
        });

        return new UploadFileResult(
            stored.key,
            safeOriginalName,
            stored.contentType,
            stored.size,
            this.buildDownloadUri(stored.key),
            true,
            new Date(),
        );
    }

    async getDownloadStream(fileKey: string): Promise<DocumentFileDownload> {
        if (!fileKey || fileKey.length === 0) {
            throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, {fileKey});
        }

        // path traversal 방지 — 우리가 발급한 prefix 외 경로는 거부.
        if (!fileKey.startsWith(`${DocumentFileService.KEY_PREFIX}/`) || fileKey.includes('..')) {
            throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, {fileKey});
        }

        const result = await this.fileStorage.getObjectStream(fileKey);
        return {
            fileKey,
            stream: result.stream,
            size: result.size,
            contentType: result.contentType,
            contentDisposition: result.contentDisposition,
        };
    }

    private assertFileExists(input: { body: Buffer; originalFileName: string }): void {
        if (!input.body || input.body.length === 0 || !input.originalFileName) {
            throw new DomainError(ErrorCode.Document.FILE_REQUIRED, {});
        }
        if (input.body.length > DocumentFileService.MAX_FILE_BYTES) {
            throw new DomainError(ErrorCode.Document.FILE_TOO_LARGE, {
                maxBytes: DocumentFileService.MAX_FILE_BYTES,
                actualBytes: input.body.length,
            });
        }
    }

    private assertPdf(input: UploadEncryptedPdfInput): void {
        const looksPdf =
            input.contentType === DocumentFileService.PDF_CONTENT_TYPE ||
            input.originalFileName.toLowerCase().endsWith('.pdf');
        // %PDF- 매직 바이트 — content-type 위조 방지.
        const magic = input.body.subarray(0, 5).toString('utf8');
        if (!looksPdf || magic !== '%PDF-') {
            throw new DomainError(ErrorCode.Document.FILE_NOT_PDF, {
                contentType: input.contentType,
                magic,
            });
        }
    }

    private assertPassword(password: string): void {
        if (!password || password.trim().length === 0) {
            throw new DomainError(ErrorCode.Document.FILE_PASSWORD_REQUIRED, {});
        }
    }

    private sanitizeOriginalName(name: string): string {
        // 경로 구분자 / 컨트롤 문자 제거. 빈 문자열이면 'file' 로 폴백.
        const cleaned = name.replace(/[\\/]/g, '_').replace(/[\x00-\x1f]/g, '').trim();
        return cleaned.length === 0 ? 'file' : cleaned;
    }

    private buildObjectKey(originalFileName: string): string {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const ext = this.extractExtension(originalFileName);
        return `${DocumentFileService.KEY_PREFIX}/${yyyy}/${mm}/${randomUUID()}${ext}`;
    }

    private extractExtension(name: string): string {
        const dot = name.lastIndexOf('.');
        if (dot < 0 || dot === name.length - 1) return '';
        return name.substring(dot).toLowerCase();
    }

    private toContentDisposition(originalFileName: string): string {
        const encoded = encodeURIComponent(originalFileName);
        return `attachment; filename="${originalFileName.replace(/"/g, '_')}"; filename*=UTF-8''${encoded}`;
    }

    private buildDownloadUri(key: string): string {
        // 프록시 엔드포인트 경로 — 슬래시 그대로 유지(가독성).
        // 컨트롤러가 wildcard 라우트(`files/*`) 로 multi-segment 를 한 번에 받는다.
        return `/api/v1/documents/files/${key}`;
    }
}

export interface UploadPlainInput {
    readonly body: Buffer;
    readonly originalFileName: string;
    readonly contentType: string;
}

export interface UploadEncryptedPdfInput extends UploadPlainInput {
    readonly userPassword: string;
}

export interface DocumentFileDownload {
    readonly fileKey: string;
    readonly stream: Readable;
    readonly size: number;
    readonly contentType: string;
    readonly contentDisposition: string | null;
}
