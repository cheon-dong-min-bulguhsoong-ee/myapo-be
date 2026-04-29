import { Module } from '@nestjs/common';
import { IssuerFacade } from '../../application/issuer.facade';
import { IssuerAuthService } from '../../domain/issuer/service/issuer-auth.service';
import { IssuerController } from './controller/issuer.controller';

@Module({
  controllers: [IssuerController],
  providers: [IssuerAuthService, IssuerFacade],
  exports: [IssuerFacade],
})
export class IssuerModule {}
