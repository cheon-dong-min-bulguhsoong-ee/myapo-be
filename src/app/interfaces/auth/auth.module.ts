import { forwardRef, Module } from "@nestjs/common";
import { AuthFacade } from "../../application/auth/auth.facade";
import { AuthService } from "../../domain/auth/service/auth.service";
import { UserModule } from "../user/user.module";
import { AuthController } from "./controller/auth.controller";

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthFacade, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
