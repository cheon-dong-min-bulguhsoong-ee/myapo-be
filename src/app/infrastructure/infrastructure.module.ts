import { Global, Module } from "@nestjs/common";
import { TokenProvider } from "../domain/common/contract/token-provider";
import { XrplCredentialAdapter } from '../domain/credential/contract/xrpl-credential-adapter';
import { CredentialDocumentTypeRepository } from '../domain/credential/repository/credential-document-type.repository';
import { CredentialRepository } from '../domain/credential/repository/credential.repository';
import { DocumentApprovalRepository } from "../domain/document/repository/document-approval.repository";
import { DocumentStageRepository } from "../domain/document/repository/document-stage.repository";
import { DocumentTypeRepository } from "../domain/document/repository/document-type.repository";
import { DocumentRepository } from "../domain/document/repository/document.repository";
import { UserRepository } from "../domain/user/repository/user.repository";
import { TokenProviderImpl } from "./auth/token/token-provider.impl";
import { PrismaModule } from "./prisma/prisma.module";
import { Xls70CredentialAdapterImpl } from './xrpl/xls70-credential-adapter.impl';
import { CredentialDocumentTypeRepositoryImpl } from './repository/credential/persistence/credential-document-type.repository.impl';
import { CredentialRepositoryImpl } from './repository/credential/persistence/credential.repository.impl';
import { DocumentApprovalRepositoryImpl } from "./repository/document/persistence/document-approval.repository.impl";
import { DocumentStageRepositoryImpl } from "./repository/document/persistence/document-stage.repository.impl";
import { DocumentTypeRepositoryImpl } from "./repository/document/persistence/document-type.repository.impl";
import { DocumentRepositoryImpl } from "./repository/document/persistence/document.repository.impl";
import { UserRepositoryImpl } from "./repository/user/persistence/user.repository.impl";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: TokenProvider, useClass: TokenProviderImpl },
    { provide: UserRepository, useClass: UserRepositoryImpl },
    { provide: DocumentRepository, useClass: DocumentRepositoryImpl },
    { provide: CredentialRepository, useClass: CredentialRepositoryImpl },
    { provide: XrplCredentialAdapter, useClass: Xls70CredentialAdapterImpl },
    { provide: CredentialDocumentTypeRepository, useClass: CredentialDocumentTypeRepositoryImpl },
    { provide: DocumentStageRepository, useClass: DocumentStageRepositoryImpl },
    { provide: DocumentTypeRepository, useClass: DocumentTypeRepositoryImpl },
    {
      provide: DocumentApprovalRepository,
      useClass: DocumentApprovalRepositoryImpl,
    },
  ],
  exports: [
    PrismaModule,
    TokenProvider,
    UserRepository,
    DocumentRepository,
    CredentialRepository,
    XrplCredentialAdapter,
    CredentialDocumentTypeRepository,
    DocumentStageRepository,
    DocumentTypeRepository,
    DocumentApprovalRepository,
  ],
})
export class InfrastructureModule {}
