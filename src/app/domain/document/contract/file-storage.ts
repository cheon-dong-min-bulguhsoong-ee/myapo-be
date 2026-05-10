import { Readable } from "stream";

/**
 * 객체 스토리지 (R2 / S3) 추상 포트.
 *
 * 도메인은 구현체 (cloudflare-r2, AWS S3, GCS, …) 를 모르고 이 포트만 의존한다.
 * key 는 버킷 내 객체 경로(예: `documents/2026/05/<uuid>.pdf`).
 */
export abstract class FileStorage {
  abstract upload(input: FileStorageUploadInput): Promise<FileStorageObject>;

  abstract getObjectStream(key: string): Promise<FileStorageStream>;
}

export interface FileStorageUploadInput {
  readonly key: string;
  readonly body: Buffer;
  readonly contentType: string;
  readonly contentDisposition?: string;
  readonly metadata?: Record<string, string>;
}

export interface FileStorageObject {
  readonly key: string;
  readonly size: number;
  readonly etag: string | null;
  readonly contentType: string;
}

export interface FileStorageStream {
  readonly stream: Readable;
  readonly size: number;
  readonly contentType: string;
  readonly contentDisposition: string | null;
  readonly etag: string | null;
}
