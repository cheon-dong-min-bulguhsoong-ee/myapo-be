import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './app/infrastructure/infrastructure.module';
import { CommonModule } from './app/interfaces/common/common.module';
import { CredentialsModule } from './app/interfaces/credentials/credentials.module';
import { IssuerModule } from './app/interfaces/issuer/issuer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    CommonModule,
    IssuerModule,
    CredentialsModule,
  ],
})
export class AppModule {}
