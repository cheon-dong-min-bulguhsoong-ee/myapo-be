import { Module } from "@nestjs/common";
import { DocumentMvpFacade } from "../../application/document-mvp/document-mvp.facade";
import { DocumentMvpService } from "../../domain/document-mvp/service/document-mvp.service";
import { AuthModule } from "../auth/auth.module";
import { DocumentMvpController } from "./controller/document-mvp.controller";

/**
 * 문서 발급 MVP wiring.
 *
 * Repository ↔ Impl 바인딩은 InfrastructureModule (Global) 에서 일괄.
 */
@Module({
  imports: [AuthModule],
  controllers: [DocumentMvpController],
  providers: [DocumentMvpService, DocumentMvpFacade],
})
export class DocumentMvpModule {}
