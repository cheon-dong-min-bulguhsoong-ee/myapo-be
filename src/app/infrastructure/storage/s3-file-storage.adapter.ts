import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { DomainError } from '../../domain/common/error/domain.error';
import { ErrorCode } from '../../domain/common/error/error-code';
import {
    FileStorage,
    FileStorageObject,
    FileStorageStream,
    FileStorageUploadInput,
} from '../../domain/document/contract/file-storage';

/**
 * S3-compatible 객체 스토리지 어댑터.
 *
 * AWS S3 / Cloudflare R2 / MinIO / Backblaze B2 / Wasabi 등 모두 동일한 SDK 로 동작.
 * 어떤 프로바이더를 쓰는지는 `S3_ENDPOINT` 한 줄로 결정 — 도메인은 알 필요 없다.
 *
 * 필수 env:
 *   - S3_ENDPOINT          (R2: `https://<acc>.r2.cloudflarestorage.com`, AWS: 비워두면 기본 endpoint)
 *   - S3_ACCESS_KEY_ID
 *   - S3_SECRET_ACCESS_KEY
 *   - S3_BUCKET            (예: `myapo`)
 *
 * 선택 env:
 *   - S3_REGION            (기본 'auto' — R2 는 'auto', AWS 는 `us-east-1` 등)
 *   - S3_FORCE_PATH_STYLE  (기본 'true' — R2 / MinIO 호환을 위해)
 */
@Injectable()
export class S3FileStorageAdapter extends FileStorage {
    private readonly logger = new Logger(S3FileStorageAdapter.name);
    private cachedClient: S3Client | null = null;

    constructor(private readonly configService: ConfigService) {
        super();
    }

    async upload(input: FileStorageUploadInput): Promise<FileStorageObject> {
        const client = this.getClient();
        const bucket = this.getBucket();
        try {
            const response = await client.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: input.key,
                    Body: input.body,
                    ContentType: input.contentType,
                    ContentDisposition: input.contentDisposition,
                    Metadata: input.metadata,
                }),
            );
            return {
                key: input.key,
                size: input.body.length,
                etag: response.ETag ?? null,
                contentType: input.contentType,
            };
        } catch (error) {
            this.logger.error(`S3 upload failed: ${this.errorMessage(error)}`);
            throw new DomainError(ErrorCode.Document.FILE_STORAGE_FAILURE, {
                op: 'upload',
                key: input.key,
            });
        }
    }

    async getObjectStream(key: string): Promise<FileStorageStream> {
        const client = this.getClient();
        const bucket = this.getBucket();
        try {
            const response = await client.send(
                new GetObjectCommand({ Bucket: bucket, Key: key }),
            );
            const body = response.Body;
            if (!body || !this.isReadable(body)) {
                throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, { key });
            }
            return {
                stream: body,
                size: typeof response.ContentLength === 'number' ? response.ContentLength : 0,
                contentType: response.ContentType ?? 'application/octet-stream',
                contentDisposition: response.ContentDisposition ?? null,
                etag: response.ETag ?? null,
            };
        } catch (error) {
            if (error instanceof DomainError) throw error;
            if (error instanceof NoSuchKey || (error as { name?: string })?.name === 'NoSuchKey') {
                throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, { key });
            }
            this.logger.error(`S3 getObject failed: ${this.errorMessage(error)}`);
            throw new DomainError(ErrorCode.Document.FILE_STORAGE_FAILURE, {
                op: 'getObject',
                key,
            });
        }
    }

    private getClient(): S3Client {
        if (this.cachedClient) return this.cachedClient;
        const endpoint = this.getOptional('S3_ENDPOINT');
        this.cachedClient = new S3Client({
            region: this.getOptional('S3_REGION') ?? 'auto',
            ...(endpoint ? { endpoint } : {}),
            credentials: {
                accessKeyId: this.getRequired('S3_ACCESS_KEY_ID'),
                secretAccessKey: this.getRequired('S3_SECRET_ACCESS_KEY'),
            },
            forcePathStyle: (this.getOptional('S3_FORCE_PATH_STYLE') ?? 'true').toLowerCase() !== 'false',
        });
        return this.cachedClient;
    }

    private getBucket(): string {
        return this.getRequired('S3_BUCKET');
    }

    private getRequired(key: string): string {
        const value = this.getOptional(key);
        if (!value || value.length === 0) {
            throw new DomainError(ErrorCode.Document.FILE_STORAGE_FAILURE, {
                op: 'config',
                missingKey: key,
            });
        }
        return value;
    }

    private getOptional(key: string): string | null {
        return this.configService.get<string>(key) ?? process.env[key] ?? null;
    }

    private isReadable(value: unknown): value is Readable {
        return typeof (value as Readable)?.pipe === 'function';
    }

    private errorMessage(error: unknown): string {
        if (error instanceof Error) return error.message;
        return String(error);
    }
}
