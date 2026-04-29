import { Module } from '@nestjs/common';
import { IssuerFacade } from '../../application/issuer.facade';
import { CredentialQueueService } from '../../domain/issuer/service/credential-queue.service';
import { IssuerAuthService } from '../../domain/issuer/service/issuer-auth.service';
import { IssuerController } from './controller/issuer.controller';

@Module({
  controllers: [IssuerController],
  providers: [IssuerAuthService, CredentialQueueService, IssuerFacade],
  exports: [IssuerFacade],
})
export class IssuerModule {}
