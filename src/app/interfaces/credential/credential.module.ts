import { Module } from '@nestjs/common';
import { CredentialFacade } from '../../application/credential/credential.facade';
import { CredentialService } from '../../domain/credential/service/credential.service';
import { UserService } from '../../domain/user/service/user.service';
import { CredentialController } from './controller/credential.controller';

@Module({
  controllers: [CredentialController],
  providers: [CredentialService, UserService, CredentialFacade],
})
export class CredentialModule {}
