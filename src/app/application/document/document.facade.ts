import {Injectable, StreamableFile} from '@nestjs/common';
import {DocumentFileService} from '../../domain/document/service/document-file.service';
import {DocumentService} from '../../domain/document/service/document.service';
import {UserService} from '../../domain/user/service/user.service';
import {AdvanceDocumentStageReq} from '../../interfaces/document/req/advance-document-stage.req';
import {ApproveDocumentReq} from '../../interfaces/document/req/approve-document.req';
import {CreateDocumentReq} from '../../interfaces/document/req/create-document.req';
import {DocumentListReq} from '../../interfaces/document/req/document-list.req';
import {UploadEncryptedPdfReq} from '../../interfaces/document/req/upload-encrypted-pdf.req';
import {AdvanceDocumentStageRes} from '../../interfaces/document/res/advance-document-stage.res';
import {ApproveDocumentRes} from '../../interfaces/document/res/approve-document.res';
import {CreateDocumentRes} from '../../interfaces/document/res/create-document.res';
import {DocumentDetailRes} from '../../interfaces/document/res/document-detail.res';
import {DocumentListRes} from '../../interfaces/document/res/document-list.res';
import {UploadFileRes} from '../../interfaces/document/res/upload-file.res';

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
    ) {
    }

    /**
     * 일반 파일 업로드 — 객체 스토리지에 평문으로 저장.
     */
    async uploadFile(file: Express.Multer.File | undefined): Promise<UploadFileRes> {
        const result = await this.documentFileService.uploadPlain({
            body: file?.buffer ?? Buffer.alloc(0),
            originalFileName: file?.originalname ?? '',
            contentType: file?.mimetype ?? 'application/octet-stream',
        });
        return UploadFileRes.from(result);
    }

    /**
     * PDF 암호화 업로드 — open-password 부착 후 저장.
     */
    async uploadEncryptedPdf(
        file: Express.Multer.File | undefined,
        request: UploadEncryptedPdfReq,
    ): Promise<UploadFileRes> {
        const result = await this.documentFileService.uploadEncryptedPdf({
            body: file?.buffer ?? Buffer.alloc(0),
            originalFileName: file?.originalname ?? '',
            contentType: file?.mimetype ?? 'application/pdf',
            userPassword: request.userPassword,
        });
        return UploadFileRes.from(result);
    }

    /**
     * 다운로드 프록시 — StreamableFile 로 wrapping.
     * NestJS 가 type/disposition/length 헤더 세팅 + 에러 핸들링까지 처리.
     */
    async downloadFile(fileKey: string): Promise<StreamableFile> {
        const file = await this.documentFileService.getDownloadStream(fileKey);
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

    async approve(
        request: ApproveDocumentReq,
        userId: bigint,
    ): Promise<ApproveDocumentRes> {
        const result = await this.documentService.approve(
            userId,
            request.documentCode,
            request.xrplTxHash,
        );
        return ApproveDocumentRes.from(result);
    }

    async advanceStage(
        request: AdvanceDocumentStageReq,
        userId: bigint,
    ): Promise<AdvanceDocumentStageRes> {
        const result = await this.documentService.advanceStage(
            userId,
            request.documentCode,
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
     * 문서 관리 행 펼침 상세.
     */
    async findDetail(documentCode: string): Promise<DocumentDetailRes> {
        const result = await this.documentService.findDetail(documentCode);
        return DocumentDetailRes.from(result);
    }
}
