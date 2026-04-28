import { Global, Module } from '@nestjs/common';
import { PasswordEncoder } from '../domain/common/contract/password-encoder';
import { TokenProvider } from '../domain/common/contract/token-provider';
import { ScryptPasswordEncoder } from './auth/scrypt-password-encoder';
import { HmacTokenProvider } from './auth/hmac-token-provider';
import { PrismaModule } from './prisma/prisma.module';
import { UserRepository } from '../domain/user/repository/user.repository';
import { MyDataSnapshotRepository } from '../domain/mydata/repository/mydata-snapshot.repository';
import { CredentialRepository } from '../domain/issuer/repository/credential.repository';
import { ComplianceEventRepository } from '../domain/compliance/repository/compliance-event.repository';
import { AdmissionLogRepository } from '../domain/gateway/repository/admission-log.repository';
import { XrplTransactionRepository } from '../domain/xrpl/repository/xrpl-transaction.repository';
import { XrplCredentialClient } from '../domain/xrpl/client/xrpl-credential.client';
import { IssuerAdminRepository } from '../domain/issuer/repository/issuer-admin.repository';
import { UserRepositoryImpl } from './repository/user/persistence/user.repository.impl';
import { MyDataSnapshotRepositoryImpl } from './repository/mydata/persistence/mydata-snapshot.repository.impl';
import { CredentialRepositoryImpl } from './repository/issuer/persistence/credential.repository.impl';
import { ComplianceEventRepositoryImpl } from './repository/compliance/persistence/compliance-event.repository.impl';
import { AdmissionLogRepositoryImpl } from './repository/gateway/persistence/admission-log.repository.impl';
import { XrplTransactionRepositoryImpl } from './repository/xrpl/persistence/xrpl-transaction.repository.impl';
import { IssuerAdminRepositoryImpl } from './repository/issuer/persistence/issuer-admin.repository.impl';
import { XrplCredentialClientStub } from './xrpl/xrpl-credential.client.stub';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: UserRepository, useClass: UserRepositoryImpl },
    {
      provide: MyDataSnapshotRepository,
      useClass: MyDataSnapshotRepositoryImpl,
    },
    { provide: CredentialRepository, useClass: CredentialRepositoryImpl },
    {
      provide: ComplianceEventRepository,
      useClass: ComplianceEventRepositoryImpl,
    },
    { provide: AdmissionLogRepository, useClass: AdmissionLogRepositoryImpl },
    {
      provide: XrplTransactionRepository,
      useClass: XrplTransactionRepositoryImpl,
    },
    { provide: IssuerAdminRepository, useClass: IssuerAdminRepositoryImpl },
    { provide: XrplCredentialClient, useClass: XrplCredentialClientStub },
    { provide: PasswordEncoder, useClass: ScryptPasswordEncoder },
    { provide: TokenProvider, useClass: HmacTokenProvider },
  ],
  exports: [
    PrismaModule,
    UserRepository,
    MyDataSnapshotRepository,
    CredentialRepository,
    ComplianceEventRepository,
    AdmissionLogRepository,
    XrplTransactionRepository,
    IssuerAdminRepository,
    XrplCredentialClient,
    PasswordEncoder,
    TokenProvider,
  ],
})
export class InfrastructureModule {}
