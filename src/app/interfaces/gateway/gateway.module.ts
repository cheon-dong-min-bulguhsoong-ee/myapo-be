import { Module } from '@nestjs/common';
import { GatewayFacade } from '../../application/gateway.facade';
import { CredentialService } from '../../domain/issuer/credential.service';
import { UserService } from '../../domain/user/user.service';
import { AdmissionLogService } from '../../domain/gateway/admission-log.service';
import { GatewayService } from '../../domain/gateway/gateway.service';
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
