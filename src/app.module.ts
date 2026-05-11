import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { InfrastructureModule } from "./app/infrastructure/infrastructure.module";
import { AuthModule } from "./app/interfaces/auth/auth.module";
import { CommonModule } from "./app/interfaces/common/common.module";
import { CredentialModule } from "./app/interfaces/credential/credential.module";
import { DisputeModule } from "./app/interfaces/dispute/dispute.module";
import { DocumentMvpModule } from "./app/interfaces/document-mvp/document-mvp.module";
import { DocumentModule } from "./app/interfaces/document/document.module";
import { UserModule } from "./app/interfaces/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    AuthModule,
    CommonModule,
    CredentialModule,
    DisputeModule,
    DocumentModule,
    DocumentMvpModule,
    UserModule,
  ],
})
export class AppModule {}
