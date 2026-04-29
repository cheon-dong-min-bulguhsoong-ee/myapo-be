import { Module } from '@nestjs/common';
import { CredentialFacade } from '../../application/credential.facade';
import { CredentialBundleService } from '../../domain/issuer/service/credential-bundle.service';
import { UserService } from '../../domain/user/service/user.service';
import { CredentialsController } from './controller/credentials.controller';

@Module({
  controllers: [CredentialsController],
  providers: [UserService, CredentialBundleService, CredentialFacade],
  exports: [CredentialFacade],
})
export class CredentialsModule {}
