import { Global, Module } from '@nestjs/common';
import { AuthService } from '../../domain/auth/service/auth.service';

@Global()
@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
