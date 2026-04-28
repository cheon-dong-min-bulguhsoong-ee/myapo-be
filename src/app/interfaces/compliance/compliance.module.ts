import { Module } from '@nestjs/common';
import { ComplianceFacade } from '../../application/compliance.facade';
import { ComplianceEventService } from '../../domain/compliance/service/compliance-event.service';
import { ComplianceService } from '../../domain/compliance/service/compliance.service';
import { MyDataService } from '../../domain/mydata/service/mydata.service';
import { UserService } from '../../domain/user/service/user.service';
import { XrplCredentialService } from '../../domain/xrpl/service/xrpl-credential.service';
import { XrplTransactionService } from '../../domain/xrpl/service/xrpl-transaction.service';
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
