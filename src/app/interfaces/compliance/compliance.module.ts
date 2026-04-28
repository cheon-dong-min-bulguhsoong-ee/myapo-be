import { Module } from '@nestjs/common';
import { ComplianceFacade } from '../../application/compliance.facade';
import { ComplianceEventService } from '../../domain/compliance/compliance-event.service';
import { ComplianceService } from '../../domain/compliance/compliance.service';
import { MyDataService } from '../../domain/mydata/mydata.service';
import { UserService } from '../../domain/user/user.service';
import { XrplCredentialService } from '../../domain/xrpl/xrpl-credential.service';
import { XrplTransactionService } from '../../domain/xrpl/xrpl-transaction.service';
import { ComplianceController } from './controller/compliance.controller';

@Module({
  controllers: [ComplianceController],
  providers: [
    UserService,
    MyDataService,
    ComplianceService,
    ComplianceEventService,
    XrplCredentialService,
    XrplTransactionService,
    ComplianceFacade,
  ],
  exports: [ComplianceFacade],
})
export class ComplianceModule {}
