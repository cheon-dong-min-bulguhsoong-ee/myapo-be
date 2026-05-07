import {Global, Module} from '@nestjs/common';
import {DocumentApprovalRepository} from '../domain/document/repository/document-approval.repository';
import {DocumentStageRepository} from '../domain/document/repository/document-stage.repository';
import {DocumentTypeRepository} from '../domain/document/repository/document-type.repository';
import {DocumentRepository} from '../domain/document/repository/document.repository';
import {UserRepository} from '../domain/user/repository/user.repository';
import {PrismaModule} from './prisma/prisma.module';
import {DocumentApprovalRepositoryImpl} from './repository/document/persistence/document-approval.repository.impl';
import {DocumentStageRepositoryImpl} from './repository/document/persistence/document-stage.repository.impl';
import {DocumentTypeRepositoryImpl} from './repository/document/persistence/document-type.repository.impl';
import {DocumentRepositoryImpl} from './repository/document/persistence/document.repository.impl';
import {UserRepositoryImpl} from './repository/user/persistence/user.repository.impl';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [
        {provide: UserRepository, useClass: UserRepositoryImpl},
        {provide: DocumentRepository, useClass: DocumentRepositoryImpl},
        {provide: DocumentStageRepository, useClass: DocumentStageRepositoryImpl},
        {provide: DocumentTypeRepository, useClass: DocumentTypeRepositoryImpl},
        {
            provide: DocumentApprovalRepository,
            useClass: DocumentApprovalRepositoryImpl,
        },
    ],
    exports: [
        PrismaModule,
        UserRepository,
        DocumentRepository,
        DocumentStageRepository,
        DocumentTypeRepository,
        DocumentApprovalRepository,
    ],
})
export class InfrastructureModule {
}
