import { Body, Controller, Post } from '@nestjs/common';
import { DocumentFacade } from '../../../application/document.facade';
import { CommonRes } from '../../common/common-res';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreateDocumentReq } from '../req/create-document.req';
import { CreateDocumentRes } from '../res/create-document.res';
import {
  CreateDocumentSwaggerApi,
  DocumentApiTags,
} from '../swagger/document.swagger.api';

@DocumentApiTags()
@Controller('api/v1/documents')
export class DocumentController {
  constructor(private readonly documentFacade: DocumentFacade) {}

  @Post()
  @CreateDocumentSwaggerApi()
  async create(
    @CurrentUserId() userId: bigint,
    @Body() request: CreateDocumentReq,
  ): Promise<CommonRes<CreateDocumentRes>> {
    const result = await this.documentFacade.create(
      userId,
      request.documentTypeCode,
    );
    return CommonRes.success(CreateDocumentRes.from(result));
  }
}
