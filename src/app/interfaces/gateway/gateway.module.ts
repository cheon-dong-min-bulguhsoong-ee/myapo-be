import { Module } from '@nestjs/common';
import { GatewayFacade } from '../../application/gateway.facade';
import { CredentialService } from '../../domain/issuer/service/credential.service';
import { UserService } from '../../domain/user/service/user.service';
import { AdmissionLogService } from '../../domain/gateway/service/admission-log.service';
import { GatewayService } from '../../domain/gateway/service/gateway.service';
import { GatewayController } from './controller/gateway.controller';

@Module({
  controllers: [GatewayController],
  providers: [
    UserService,
    CredentialService,
    AdmissionLogService,
    GatewayService,
    GatewayFacade,
  ],
  exports: [GatewayFacade],
})
export class GatewayModule {}
