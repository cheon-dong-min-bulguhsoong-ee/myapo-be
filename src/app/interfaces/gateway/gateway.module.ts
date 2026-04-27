import { Module } from '@nestjs/common';
import { GatewayController } from './controller/gateway.controller';
import { GatewayService } from '../../domain/gateway/service/gateway.service';

@Module({
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
