import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import { FileStorage } from "../contract/file-storage";
import { PdfEncryptor } from "../contract/pdf-encryptor";
import { UploadFileResult } from "../dto/upload-file.result";
import { DocumentStage } from "../enum/document-stage.enum";
import { DocumentStageRepository } from "../repository/document-stage.repository";
import { DocumentRepository } from "../repository/document.repository";

/**
 * 문서 첨부 파일 도메인 서비스 — Document + Stage 단위로 묶인다.
 *
 * 흐름:
 *   1) 사용자가 (documentCode, stage) 로 파일 업로드
 *   2) 객체 스토리지에 `documents/<documentCode>/<stage>/<UUID>.<ext>` 키로 저장
 *   3) `document_stages.s3_object_key` 컬럼 갱신 (해당 stage 행이 없으면 PENDING 으로 신규 생성)
 *   4) 다운로드는 (documentCode, stage) 로 룩업 → s3_object_key 로 R2 에서 스트리밍
 *
 * 다운로드는 백엔드 프록시 형태 — 버킷은 private 유지, 외부에는 stage 기반 경로만 노출.
 */
@Injectable()
export class DocumentFileService {
  /** 50 MiB. 도메인 정책으로 못 박는다 — multer 도 이 값으로 게이트. */
  static readonly MAX_FILE_BYTES = 50 * 1024 * 1024;

  /** 모든 업로드 객체는 이 prefix 아래에 저장. 다른 도메인이 같은 버킷을 써도 충돌 안 나게. */
  private static readonly KEY_PREFIX = "documents";

  private static readonly PDF_CONTENT_TYPE = "application/pdf";

  constructor(
    private readonly fileStorage: FileStorage,
    private readonly pdfEncryptor: PdfEncryptor,
    private readonly documentRepository: DocumentRepository,
    private readonly documentStageRepository: DocumentStageRepository,
  ) {}

  async uploadPlain(input: UploadPlainInput): Promise<UploadFileResult> {
    this.assertFileExists(input);
    const document = await this.assertDocumentOwned(
      input.documentCode,
      input.userId,
    );

    const safeOriginalName = this.sanitizeOriginalName(input.originalFileName);
    const key = this.buildObjectKey(
      document.documentCode,
      input.stage,
      safeOriginalName,
    );

    const stored = await this.fileStorage.upload({
      key,
      body: input.body,
      contentType: input.contentType,
      contentDisposition: this.toContentDisposition(safeOriginalName),
      metadata: {
        "original-filename": encodeURIComponent(safeOriginalName),
        "document-code": document.documentCode,
        stage: input.stage,
        "user-pk": document.userId.toString(),
      },
    });

    await this.documentStageRepository.setS3ObjectKey(
      document.id,
      input.stage,
      stored.key,
    );

    return new UploadFileResult(
      stored.key,
      safeOriginalName,
      stored.contentType,
      stored.size,
      this.buildDownloadUri(document.documentCode, input.stage),
      false,
      new Date(),
    );
  }

  async uploadEncryptedPdf(
    input: UploadEncryptedPdfInput,
  ): Promise<UploadFileResult> {
    this.assertFileExists(input);
    this.assertPdf(input);
    this.assertPassword(input.userPassword);
    const document = await this.assertDocumentOwned(
      input.documentCode,
      input.userId,
    );

    const safeOriginalName = this.sanitizeOriginalName(input.originalFileName);
    const encryptedBuffer = await this.pdfEncryptor.protectWithPassword({
      source: input.body,
      userPassword: input.userPassword,
    });

    const key = this.buildObjectKey(
      document.documentCode,
      input.stage,
      safeOriginalName,
    );
    const stored = await this.fileStorage.upload({
      key,
      body: encryptedBuffer,
      contentType: DocumentFileService.PDF_CONTENT_TYPE,
      contentDisposition: this.toContentDisposition(safeOriginalName),
      metadata: {
        "original-filename": encodeURIComponent(safeOriginalName),
        encryption: "pdf-password",
        "document-code": document.documentCode,
        stage: input.stage,
        "user-pk": document.userId.toString(),
      },
    });

    await this.documentStageRepository.setS3ObjectKey(
      document.id,
      input.stage,
      stored.key,
    );

    return new UploadFileResult(
      stored.key,
      safeOriginalName,
      stored.contentType,
      stored.size,
      this.buildDownloadUri(document.documentCode, input.stage),
      true,
      new Date(),
    );
  }

  /**
   * (documentCode, stage) 로 저장된 첨부 파일 스트림을 가져온다.
   * 소유자 검증 + s3_object_key 룩업 + R2 GetObject.
   */
  async downloadByStage(
    input: DownloadByStageInput,
  ): Promise<DocumentFileDownload> {
    const document = await this.assertDocumentOwned(
      input.documentCode,
      input.userId,
    );

    const stageEvent =
      await this.documentStageRepository.findLatestByDocumentIdAndStage(
        document.id,
        input.stage,
      );
    const fileKey = stageEvent?.s3ObjectKey;
    if (!fileKey || fileKey.length === 0) {
      throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, {
        documentCode: input.documentCode,
        stage: input.stage,
      });
    }

    // path traversal 방지 — 우리 prefix 외 키는 거부 (DB 가 오염되었을 때 안전망).
    if (
      !fileKey.startsWith(`${DocumentFileService.KEY_PREFIX}/`) ||
      fileKey.includes("..")
    ) {
      throw new DomainError(ErrorCode.Document.FILE_NOT_FOUND, { fileKey });
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

  private async assertDocumentOwned(
    documentCode: string,
    userId: bigint,
  ): Promise<{ id: bigint; documentCode: string; userId: bigint }> {
    const document = await this.documentRepository.findByCode(documentCode);
    if (document === null) {
      throw new DomainError(ErrorCode.Document.NOT_FOUND, { documentCode });
    }
    if (document.userId !== userId) {
      throw new DomainError(ErrorCode.Document.NOT_OWNED, { documentCode });
    }
    return document;
  }

  private assertFileExists(input: {
    body: Buffer;
    originalFileName: string;
  }): void {
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
      input.originalFileName.toLowerCase().endsWith(".pdf");
    // %PDF- 매직 바이트 — content-type 위조 방지.
    const magic = input.body.subarray(0, 5).toString("utf8");
    if (!looksPdf || magic !== "%PDF-") {
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
    const cleaned = name
      .replace(/[\\/]/g, "_")
      .replace(/[\x00-\x1f]/g, "")
      .trim();
    return cleaned.length === 0 ? "file" : cleaned;
  }

  private buildObjectKey(
    documentCode: string,
    stage: DocumentStage,
    originalFileName: string,
  ): string {
    // 키 규약: documents/<documentCode>/<stage>/<UUID>.<ext>
    // 같은 (document, stage) 에 다회 업로드해도 UUID 로 충돌 방지 (DB 의 s3_object_key 는 최신 키만 가리킴).
    const ext = this.extractExtension(originalFileName);
    return `${DocumentFileService.KEY_PREFIX}/${documentCode}/${stage}/${randomUUID()}${ext}`;
  }

  private extractExtension(name: string): string {
    const dot = name.lastIndexOf(".");
    if (dot < 0 || dot === name.length - 1) return "";
    return name.substring(dot).toLowerCase();
  }

  private toContentDisposition(originalFileName: string): string {
    const encoded = encodeURIComponent(originalFileName);
    return `attachment; filename="${originalFileName.replace(/"/g, "_")}"; filename*=UTF-8''${encoded}`;
  }

  private buildDownloadUri(documentCode: string, stage: DocumentStage): string {
    // stage 기반 다운로드 엔드포인트 — 클라이언트는 R2 키를 직접 알 필요 없음.
    return `/api/v1/documents/${documentCode}/files/${stage}`;
  }
}

export interface UploadPlainInput {
  readonly body: Buffer;
  readonly originalFileName: string;
  readonly contentType: string;
  readonly documentCode: string;
  readonly stage: DocumentStage;
  readonly userId: bigint;
}

export interface UploadEncryptedPdfInput extends UploadPlainInput {
  readonly userPassword: string;
}

export interface DownloadByStageInput {
  readonly documentCode: string;
  readonly stage: DocumentStage;
  readonly userId: bigint;
}

export interface DocumentFileDownload {
  readonly fileKey: string;
  readonly stream: Readable;
  readonly size: number;
  readonly contentType: string;
  readonly contentDisposition: string | null;
}
