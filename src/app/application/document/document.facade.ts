import { Injectable, StreamableFile } from "@nestjs/common";
import { DocumentFileService } from "../../domain/document/service/document-file.service";
import { DocumentService } from "../../domain/document/service/document.service";
import { DocumentStage } from "../../domain/document/enum/document-stage.enum";
import { UserService } from "../../domain/user/service/user.service";
import { AdvanceDocumentStageReq } from "../../interfaces/document/req/advance-document-stage.req";
import { CreateDocumentReq } from "../../interfaces/document/req/create-document.req";
import { DocumentListReq } from "../../interfaces/document/req/document-list.req";
import { DocumentTypeListReq } from "../../interfaces/document/req/document-type-list.req";
import { UploadEncryptedPdfReq } from "../../interfaces/document/req/upload-encrypted-pdf.req";
import { UploadFileReq } from "../../interfaces/document/req/upload-file.req";
import { AdvanceDocumentStageRes } from "../../interfaces/document/res/advance-document-stage.res";
import { CreateDocumentRes } from "../../interfaces/document/res/create-document.res";
import { DocumentDetailRes } from "../../interfaces/document/res/document-detail.res";
import { DocumentListRes } from "../../interfaces/document/res/document-list.res";
import { DocumentTypeListRes } from "../../interfaces/document/res/document-type-list.res";
import { UploadFileRes } from "../../interfaces/document/res/upload-file.res";

/**
 * 문서 도메인 Facade — 컨텍스트의 모든 유스케이스 메서드를 모은다.
 *
 * 책임:
 *   - 인터페이스 레이어의 Request 를 받아 도메인 입력으로 풀어 service 호출
 *   - 도메인 Result 를 Response 로 매핑(`Res.from(domainResult)`)해서 반환
 *   - 도메인 service 여러 개 조합해 한 유스케이스 구성
 *
 * Command/Query 같은 별도 DTO 를 도입하지 않는다 — Request 가 인풋 carrier 역할.
 * DomainError 는 catch 하지 않는다(글로벌 핸들러로 흐름).
 */
@Injectable()
export class DocumentFacade {
  constructor(
    private readonly documentService: DocumentService,
    private readonly userService: UserService,
    private readonly documentFileService: DocumentFileService,
  ) {}

  /**
   * 일반 파일 업로드 — 객체 스토리지에 평문으로 저장 + `document_stages.s3_object_key` 갱신.
   * 키 형식: `documents/<documentCode>/<stage>/<UUID>.<ext>`
   */
  async uploadFile(
    file: Express.Multer.File | undefined,
    request: UploadFileReq,
    userId: bigint,
  ): Promise<UploadFileRes> {
    const result = await this.documentFileService.uploadPlain({
      body: file?.buffer ?? Buffer.alloc(0),
      originalFileName: file?.originalname ?? "",
      contentType: file?.mimetype ?? "application/octet-stream",
      documentCode: request.documentCode,
      stage: request.stage,
      userId,
    });
    return UploadFileRes.from(result);
  }

  /**
   * PDF 암호화 업로드 — open-password 부착 후 저장 + `document_stages.s3_object_key` 갱신.
   * 키 형식: `documents/<documentCode>/<stage>/<UUID>.pdf`
   */
  async uploadEncryptedPdf(
    file: Express.Multer.File | undefined,
    request: UploadEncryptedPdfReq,
    userId: bigint,
  ): Promise<UploadFileRes> {
    const result = await this.documentFileService.uploadEncryptedPdf({
      body: file?.buffer ?? Buffer.alloc(0),
      originalFileName: file?.originalname ?? "",
      contentType: file?.mimetype ?? "application/pdf",
      userPassword: request.userPassword,
      documentCode: request.documentCode,
      stage: request.stage,
      userId,
    });
    return UploadFileRes.from(result);
  }

  /**
   * (documentCode, stage) 기반 다운로드 프록시 — StreamableFile 로 wrapping.
   * NestJS 가 type/disposition/length 헤더 세팅 + 에러 핸들링까지 처리.
   */
  async downloadFileByStage(
    documentCode: string,
    stage: DocumentStage,
    userId: bigint,
  ): Promise<StreamableFile> {
    const file = await this.documentFileService.downloadByStage({
      documentCode,
      stage,
      userId,
    });
    return new StreamableFile(file.stream, {
      type: file.contentType,
      disposition: file.contentDisposition ?? undefined,
      length: file.size > 0 ? file.size : undefined,
    });
  }

  async create(
    request: CreateDocumentReq,
    userId: bigint,
  ): Promise<CreateDocumentRes> {
    const user = await this.userService.getActive(userId);
    const result = await this.documentService.create(
      userId,
      request.documentTypeCode,
      user.personaType,
    );
    return CreateDocumentRes.from(result);
  }

  /**
   * 문서 단계 승인 + 전이 — DocumentApproval INSERT 와 current_stage 갱신을 한 호출에 묶는다.
   * 기존 `POST /documents/approvals` + `POST /documents/stages/advance` 두 API 가 이리로 통합됨.
   */
  async advanceStage(
    documentCode: string,
    request: AdvanceDocumentStageReq,
    userId: bigint,
  ): Promise<AdvanceDocumentStageRes> {
    const result = await this.documentService.advanceStage(
      userId,
      documentCode,
      request.xrplTxHash,
    );
    return AdvanceDocumentStageRes.from(result);
  }

  /**
   * 문서 관리 페이지 리스트.
   *
   * 콘솔(운영자) 뷰 — 본인 소유 필터 없이 전체 조회.
   * 인증은 JwtAuthGuard 가 담당하므로 facade 까지 userId 를 들고 올 필요 없다.
   */
  async findList(request: DocumentListReq): Promise<DocumentListRes> {
    const result = await this.documentService.findList({
      status: request.status,
      documentTypeCode: request.documentTypeCode,
      countryCode: request.countryCode,
      q: request.q,
      page: request.page ?? 1,
      limit: request.limit ?? 20,
    });
    return DocumentListRes.from(result);
  }

  /**
   * 발급 가능한 카탈로그 리스트 — 와이어프레임 "서류 발급 신청" 화면.
   * 인증된 사용자라면 누구나 호출 가능 (페르소나 필터는 query 로만 좁힌다).
   */
  async listAvailableTypes(
    request: DocumentTypeListReq,
  ): Promise<DocumentTypeListRes> {
    const items = await this.documentService.listAvailableTypes(
      request.personaType,
    );
    return DocumentTypeListRes.from(items);
  }

  /**
   * 문서 관리 행 펼침 상세.
   */
  async findDetail(documentCode: string): Promise<DocumentDetailRes> {
    const result = await this.documentService.findDetail(documentCode);
    return DocumentDetailRes.from(result);
  }
}
