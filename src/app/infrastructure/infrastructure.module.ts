import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserRepository } from '../domain/user/repository/user.repository';
import { MyDataSnapshotRepository } from '../domain/mydata/repository/mydata-snapshot.repository';
import { CredentialRepository } from '../domain/issuer/repository/credential.repository';
import { ComplianceEventRepository } from '../domain/compliance/repository/compliance-event.repository';
import { AdmissionLogRepository } from '../domain/gateway/repository/admission-log.repository';
import { XrplTransactionRepository } from '../domain/xrpl/repository/xrpl-transaction.repository';
import { XrplCredentialClient } from '../domain/xrpl/client/xrpl-credential.client';
import { PrismaUserRepository } from './repository/prisma-user.repository';
import { PrismaMyDataSnapshotRepository } from './repository/prisma-mydata-snapshot.repository';
import { PrismaCredentialRepository } from './repository/prisma-credential.repository';
import { PrismaComplianceEventRepository } from './repository/prisma-compliance-event.repository';
import { PrismaAdmissionLogRepository } from './repository/prisma-admission-log.repository';
import { PrismaXrplTransactionRepository } from './repository/prisma-xrpl-transaction.repository';
import { XrplCredentialClientStub } from './xrpl/xrpl-credential.client.stub';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: MyDataSnapshotRepository, useClass: PrismaMyDataSnapshotRepository },
    { provide: CredentialRepository, useClass: PrismaCredentialRepository },
    { provide: ComplianceEventRepository, useClass: PrismaComplianceEventRepository },
    { provide: AdmissionLogRepository, useClass: PrismaAdmissionLogRepository },
    { provide: XrplTransactionRepository, useClass: PrismaXrplTransactionRepository },
    { provide: XrplCredentialClient, useClass: XrplCredentialClientStub },
  ],
  exports: [
    PrismaModule,
    UserRepository,
    MyDataSnapshotRepository,
    CredentialRepository,
    ComplianceEventRepository,
    AdmissionLogRepository,
    XrplTransactionRepository,
    XrplCredentialClient,
  ],
})
export class InfrastructureModule {}
