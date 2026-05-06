import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './app/infrastructure/infrastructure.module';
import { CommonModule } from './app/interfaces/common/common.module';
import { DocumentModule } from './app/interfaces/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    CommonModule,
    DocumentModule,
  ],
})
export class AppModule {}
