import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {DocumentFacade} from '../../../application/document/document.facade';
import {JwtAuthGuard} from '../../../infrastructure/auth/guards/jwt-auth.guard';
import {CommonRes} from '../../common/common-res';
import {CurrentUserId} from '../../user/auth/current-user-id.decorator';
import {AdvanceDocumentStageReq} from '../req/advance-document-stage.req';
import {ApproveDocumentReq} from '../req/approve-document.req';
import {CreateDocumentReq} from '../req/create-document.req';
import {DocumentListReq} from '../req/document-list.req';
import {AdvanceDocumentStageRes} from '../res/advance-document-stage.res';
import {ApproveDocumentRes} from '../res/approve-document.res';
import {CreateDocumentRes} from '../res/create-document.res';
import {DocumentDetailRes} from '../res/document-detail.res';
import {DocumentListRes} from '../res/document-list.res';
import {
    AdvanceDocumentStageSwaggerApi,
    ApproveDocumentSwaggerApi,
    CreateDocumentSwaggerApi,
    DocumentApiTags,
    GetDocumentDetailSwaggerApi,
    ListDocumentSwaggerApi,
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
