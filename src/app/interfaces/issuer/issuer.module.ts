import { Module } from '@nestjs/common';
import { IssuerFacade } from '../../application/issuer.facade';
import { MyDataService } from '../../domain/mydata/mydata.service';
import { UserService } from '../../domain/user/user.service';
import { CredentialIssuanceService } from '../../domain/issuer/credential-issuance.service';
import { CredentialService } from '../../domain/issuer/credential.service';
import { IssuerAuthService } from '../../domain/issuer/issuer-auth.service';
import { XrplCredentialService } from '../../domain/xrpl/xrpl-credential.service';
import { XrplTransactionService } from '../../domain/xrpl/xrpl-transaction.service';
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
