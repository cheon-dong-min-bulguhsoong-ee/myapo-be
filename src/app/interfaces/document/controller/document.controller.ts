import {Body, Controller, Post} from '@nestjs/common';
import {DocumentFacade} from '../../../application/document/document.facade';
import {CommonRes} from '../../common/common-res';
import {CurrentUserId} from '../auth/current-user-id.decorator';
import {AdvanceDocumentStageReq} from '../req/advance-document-stage.req';
import {ApproveDocumentReq} from '../req/approve-document.req';
import {CreateDocumentReq} from '../req/create-document.req';
import {AdvanceDocumentStageRes} from '../res/advance-document-stage.res';
import {ApproveDocumentRes} from '../res/approve-document.res';
import {CreateDocumentRes} from '../res/create-document.res';
import {
    AdvanceDocumentStageSwaggerApi,
    ApproveDocumentSwaggerApi,
    CreateDocumentSwaggerApi,
    DocumentApiTags,
} from '../swagger/document.swagger.api';

@DocumentApiTags()
@Controller('api/v1/documents')
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
}
