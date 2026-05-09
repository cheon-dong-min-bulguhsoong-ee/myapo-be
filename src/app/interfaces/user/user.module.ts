import { forwardRef, Module } from "@nestjs/common";
import { UserFacade } from "../../application/user/user.facade";
import { UserService } from "../../domain/user/service/user.service";
import { RolesGuard } from "../../infrastructure/auth/guards/roles.guard";
import { AuthModule } from "../auth/auth.module";
import { UserController } from "./controller/user.controller";

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserFacade, UserService, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
