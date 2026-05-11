import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { DocumentMvpFacade } from "../../../application/document-mvp/document-mvp.facade";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { CommonRes } from "../../common/common-res";
import { CurrentUserId } from "../../user/auth/current-user-id.decorator";
import { CreateDocumentMvpReq } from "../req/create-document-mvp.req";
import { AdvanceDocumentMvpRes } from "../res/advance-document-mvp.res";
import { CreateDocumentMvpRes } from "../res/create-document-mvp.res";
import { DocumentMvpDetailRes } from "../res/document-mvp-detail.res";
import { DocumentMvpListRes } from "../res/document-mvp-list.res";
import {
  AdvanceDocumentMvpSwaggerApi,
  CreateDocumentMvpSwaggerApi,
  DocumentMvpApiTags,
  GetDocumentMvpDetailSwaggerApi,
  ListDocumentMvpSwaggerApi,
} from "../swagger/document-mvp.swagger.api";

@DocumentMvpApiTags()
@Controller("api/v1/document-mvp")
@UseGuards(JwtAuthGuard)
export class DocumentMvpController {
  constructor(private readonly facade: DocumentMvpFacade) {}

  @Post()
  @CreateDocumentMvpSwaggerApi()
  async create(
    @CurrentUserId() userId: bigint,
    @Body() request: CreateDocumentMvpReq,
  ): Promise<CommonRes<CreateDocumentMvpRes>> {
    const response = await this.facade.create(request, userId);
    return CommonRes.success(response);
  }

  @Get()
  @ListDocumentMvpSwaggerApi()
  async list(
    @CurrentUserId() userId: bigint,
  ): Promise<CommonRes<DocumentMvpListRes>> {
    const response = await this.facade.findListByUser(userId);
    return CommonRes.success(response);
  }

  @Post(":documentCode/advance")
  @AdvanceDocumentMvpSwaggerApi()
  async advance(
    @CurrentUserId() userId: bigint,
    @Param("documentCode") documentCode: string,
  ): Promise<CommonRes<AdvanceDocumentMvpRes>> {
    const response = await this.facade.advance(userId, documentCode);
    return CommonRes.success(response);
  }

  @Get(":documentCode")
  @GetDocumentMvpDetailSwaggerApi()
  async detail(
    @Param("documentCode") documentCode: string,
  ): Promise<CommonRes<DocumentMvpDetailRes>> {
    const response = await this.facade.findDetail(documentCode);
    return CommonRes.success(response);
  }
}
