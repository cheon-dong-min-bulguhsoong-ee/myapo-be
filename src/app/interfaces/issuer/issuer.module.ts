import { Module } from '@nestjs/common';
import { IssuerController } from './controller/issuer.controller';
import { IssuerService } from '../../domain/issuer/service/issuer.service';

@Module({
  controllers: [IssuerController],
  providers: [IssuerService],
  exports: [IssuerService],
})
export class IssuerModule {}
