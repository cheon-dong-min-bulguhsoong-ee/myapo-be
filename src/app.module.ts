import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './app/infrastructure/infrastructure.module';
import { CommonModule } from './app/interfaces/common/common.module';
import { MyDataModule } from './app/interfaces/mydata/mydata.module';
import { IssuerModule } from './app/interfaces/issuer/issuer.module';
import { ComplianceModule } from './app/interfaces/compliance/compliance.module';
import { GatewayModule } from './app/interfaces/gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    CommonModule,
    MyDataModule,
    IssuerModule,
    ComplianceModule,
    GatewayModule,
  ],
})
export class AppModule {}
