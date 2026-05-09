import { Module } from '@nestjs/common';
import { CredentialFacade } from '../../application/credential/credential.facade';
import { CredentialService } from '../../domain/credential/service/credential.service';
import { UserService } from '../../domain/user/service/user.service';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { CredentialController } from './controller/credential.controller';

@Module({
  imports: [AuthModule],
  controllers: [CredentialController],
  providers: [CredentialService, UserService, CredentialFacade, RolesGuard],
})
export class CredentialModule {}
