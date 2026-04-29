import { Global, Module } from '@nestjs/common';
import { PasswordEncoder } from '../domain/common/contract/password-encoder';
import { TokenProvider } from '../domain/common/contract/token-provider';
import { CredentialBundleRepository } from '../domain/issuer/repository/credential-bundle.repository';
import { IssuerAdminRepository } from '../domain/issuer/repository/issuer-admin.repository';
import { UserRepository } from '../domain/user/repository/user.repository';
import { ScryptPasswordEncoder } from './auth/scrypt-password-encoder';
import { HmacTokenProvider } from './auth/hmac-token-provider';
import { PrismaModule } from './prisma/prisma.module';
import { CredentialBundleRepositoryImpl } from './repository/issuer/persistence/credential-bundle.repository.impl';
import { IssuerAdminRepositoryImpl } from './repository/issuer/persistence/issuer-admin.repository.impl';
import { UserRepositoryImpl } from './repository/user/persistence/user.repository.impl';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: UserRepository, useClass: UserRepositoryImpl },
    { provide: IssuerAdminRepository, useClass: IssuerAdminRepositoryImpl },
    {
      provide: CredentialBundleRepository,
      useClass: CredentialBundleRepositoryImpl,
    },
    { provide: PasswordEncoder, useClass: ScryptPasswordEncoder },
    { provide: TokenProvider, useClass: HmacTokenProvider },
  ],
  exports: [
    PrismaModule,
    UserRepository,
    IssuerAdminRepository,
    CredentialBundleRepository,
    PasswordEncoder,
    TokenProvider,
  ],
})
export class InfrastructureModule {}
