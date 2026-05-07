import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './app/infrastructure/infrastructure.module';
import { AuthModule } from './app/interfaces/auth/auth.module';
import { CommonModule } from './app/interfaces/common/common.module';
import { DocumentModule } from './app/interfaces/document/document.module';
import { UserModule } from './app/interfaces/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    AuthModule,
    CommonModule,
    DocumentModule,
    UserModule,
  ],
})
export class AppModule {}
