import { Module } from '@nestjs/common';
import { DisputeFacade } from '../../application/dispute/dispute.facade';
import { DisputeService } from '../../domain/dispute/service/dispute.service';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { CredentialModule } from '../credential/credential.module';
import { DisputeController } from './controller/dispute.controller';

@Module({
  imports: [AuthModule, CredentialModule],
  controllers: [DisputeController],
  providers: [DisputeService, DisputeFacade, RolesGuard],
  exports: [DisputeService],
})
export class DisputeModule {}
