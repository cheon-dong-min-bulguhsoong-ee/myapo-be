import {Body, Controller, Get, Param, Post, Query, StreamableFile, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {DocumentFacade} from '../../../application/document/document.facade';
import {DocumentFileService} from '../../../domain/document/service/document-file.service';
import {JwtAuthGuard} from '../../../infrastructure/auth/guards/jwt-auth.guard';
import {CommonRes} from '../../common/common-res';
import {CurrentUserId} from '../../user/auth/current-user-id.decorator';
import {AdvanceDocumentStageReq} from '../req/advance-document-stage.req';
import {ApproveDocumentReq} from '../req/approve-document.req';
import {CreateDocumentReq} from '../req/create-document.req';
import {DocumentListReq} from '../req/document-list.req';
import {UploadEncryptedPdfReq} from '../req/upload-encrypted-pdf.req';
import {UploadFileReq} from '../req/upload-file.req';
import {AdvanceDocumentStageRes} from '../res/advance-document-stage.res';
import {ApproveDocumentRes} from '../res/approve-document.res';
import {CreateDocumentRes} from '../res/create-document.res';
import {DocumentDetailRes} from '../res/document-detail.res';
import {DocumentListRes} from '../res/document-list.res';
import {UploadFileRes} from '../res/upload-file.res';
import {
    AdvanceDocumentStageSwaggerApi,
    ApproveDocumentSwaggerApi,
    CreateDocumentSwaggerApi,
    DocumentApiTags,
    DownloadDocumentFileSwaggerApi,
    GetDocumentDetailSwaggerApi,
    ListDocumentSwaggerApi,
    UploadDocumentFileSwaggerApi,
    UploadEncryptedPdfSwaggerApi,
} from '../swagger/document.swagger.api';

@DocumentApiTags()
@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
    constructor(private readonly documentFacade: DocumentFacade) {
    }

    @Post()
    @CreateDocumentSwaggerApi()
    async create(
        @CurrentUserId() userId: bigint,
        @Body() request: CreateDocumentReq,
    ): Promise<CommonRes<CreateDocumentRes>> {
        const response = await this.documentFacade.create(request, userId);
        return CommonRes.success(response);
    }

    @Post('approvals')
    @ApproveDocumentSwaggerApi()
    async approve(
        @CurrentUserId() userId: bigint,
        @Body() request: ApproveDocumentReq,
    ): Promise<CommonRes<ApproveDocumentRes>> {
        const response = await this.documentFacade.approve(request, userId);
        return CommonRes.success(response);
    }

    @Post('stages/advance')
    @AdvanceDocumentStageSwaggerApi()
    async advanceStage(
        @CurrentUserId() userId: bigint,
        @Body() request: AdvanceDocumentStageReq,
    ): Promise<CommonRes<AdvanceDocumentStageRes>> {
        const response = await this.documentFacade.advanceStage(request, userId);
        return CommonRes.success(response);
    }

    /**
     * 문서 관리 페이지 리스트 — 와이어프레임 console.html docs 탭의 8컬럼.
     * 자세한 필터 옵션은 DocumentListReq 참조.
     */
    @Get()
    @ListDocumentSwaggerApi()
    async findList(
        @Query() request: DocumentListReq,
    ): Promise<CommonRes<DocumentListRes>> {
        const response = await this.documentFacade.findList(request);
        return CommonRes.success(response);
    }

    /**
     * 일반 파일 업로드 — `file` + `stage`. userPk 는 JWT 에서.
     */
    @Post('files/upload')
    @UseInterceptors(FileInterceptor('file', {limits: {fileSize: DocumentFileService.MAX_FILE_BYTES}}))
    @UploadDocumentFileSwaggerApi()
    async uploadFile(
        @CurrentUserId() userId: bigint,
        @UploadedFile() file: Express.Multer.File,
        @Body() request: UploadFileReq,
    ): Promise<CommonRes<UploadFileRes>> {
        const response = await this.documentFacade.uploadFile(file, request, userId);
        return CommonRes.success(response);
    }

    /**
     * PDF 암호화 업로드 — `file` + `stage` + `userPassword`. userPk 는 JWT 에서.
     */
    @Post('files/upload-encrypted')
    @UseInterceptors(FileInterceptor('file', {limits: {fileSize: DocumentFileService.MAX_FILE_BYTES}}))
    @UploadEncryptedPdfSwaggerApi()
    async uploadEncryptedPdf(
        @CurrentUserId() userId: bigint,
        @UploadedFile() file: Express.Multer.File,
        @Body() request: UploadEncryptedPdfReq,
    ): Promise<CommonRes<UploadFileRes>> {
        const response = await this.documentFacade.uploadEncryptedPdf(file, request, userId);
        return CommonRes.success(response);
    }

    /**
     * 파일 다운로드 프록시.
     *
     * 라우트는 `files/:fileKey(.*)` — `(.*)` 정규식이 슬래시까지 캡처해
     * `documents/<STAGE>/<userPk>/<uuid>.pdf` 같은 multi-segment key 를 한 번에 받는다.
     * 업로드 응답의 `downloadUri` 그대로 GET 호출하면 됨.
     */
    @Get('files/:fileKey(.*)')
    @DownloadDocumentFileSwaggerApi()
    async download(@Param('fileKey') fileKey: string): Promise<StreamableFile> {
        return this.documentFacade.downloadFile(fileKey);
    }

    /**
     * 행 펼침 상세 — 5단계 파이프라인 + 사용자 승인 누적.
     */
    @Get(':documentCode')
    @GetDocumentDetailSwaggerApi()
    async findDetail(
        @Param('documentCode') documentCode: string,
    ): Promise<CommonRes<DocumentDetailRes>> {
        const response = await this.documentFacade.findDetail(documentCode);
        return CommonRes.success(response);
    }
}
