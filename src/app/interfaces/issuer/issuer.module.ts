import { Module } from '@nestjs/common';
import { IssuerFacade } from '../../application/issuer.facade';
import { MyDataService } from '../../domain/mydata/service/mydata.service';
import { UserService } from '../../domain/user/service/user.service';
import { CredentialIssuanceService } from '../../domain/issuer/service/credential-issuance.service';
import { CredentialService } from '../../domain/issuer/service/credential.service';
import { IssuerAuthService } from '../../domain/issuer/service/issuer-auth.service';
import { XrplCredentialService } from '../../domain/xrpl/service/xrpl-credential.service';
import { XrplTransactionService } from '../../domain/xrpl/service/xrpl-transaction.service';
import { IssuerController } from './controller/issuer.controller';

@Module({
  controllers: [IssuerController],
  providers: [
    UserService,
    MyDataService,
    CredentialService,
    XrplCredentialService,
    XrplTransactionService,
    IssuerAuthService,
    CredentialIssuanceService,
    IssuerFacade,
  ],
  exports: [IssuerFacade],
})
export class IssuerModule {}
