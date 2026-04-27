import { Module } from '@nestjs/common';
import { ComplianceController } from './controller/compliance.controller';
import { ComplianceService } from '../../domain/compliance/service/compliance.service';

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
