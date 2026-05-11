import { Injectable } from "@nestjs/common";
import { DocumentMvpService } from "../../domain/document-mvp/service/document-mvp.service";
import { CreateDocumentMvpReq } from "../../interfaces/document-mvp/req/create-document-mvp.req";
import { AdvanceDocumentMvpRes } from "../../interfaces/document-mvp/res/advance-document-mvp.res";
import { CreateDocumentMvpRes } from "../../interfaces/document-mvp/res/create-document-mvp.res";
import { DocumentMvpDetailRes } from "../../interfaces/document-mvp/res/document-mvp-detail.res";
import { DocumentMvpListRes } from "../../interfaces/document-mvp/res/document-mvp-list.res";

/**
 * 문서 발급 MVP Facade — Req ↔ Res 매핑 전담.
 */
@Injectable()
export class DocumentMvpFacade {
  constructor(private readonly service: DocumentMvpService) {}

  async create(
    request: CreateDocumentMvpReq,
    userId: bigint,
  ): Promise<CreateDocumentMvpRes> {
    const result = await this.service.create(userId, request.documentTypeCode);
    return CreateDocumentMvpRes.from(result);
  }

  async advance(
    userId: bigint,
    documentCode: string,
  ): Promise<AdvanceDocumentMvpRes> {
    const result = await this.service.advance(userId, documentCode);
    return AdvanceDocumentMvpRes.from(result);
  }

  async findDetail(documentCode: string): Promise<DocumentMvpDetailRes> {
    const result = await this.service.findDetail(documentCode);
    return DocumentMvpDetailRes.from(result);
  }

  async findListByUser(userId: bigint): Promise<DocumentMvpListRes> {
    const result = await this.service.findListByUser(userId);
    return DocumentMvpListRes.from(result);
  }
}
