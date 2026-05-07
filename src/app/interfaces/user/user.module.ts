import { Module } from '@nestjs/common';
import { UserFacade } from '../../application/user/user.facade';
import { UserService } from '../../domain/user/service/user.service';
import { UserController } from './controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserFacade, UserService],
})
export class UserModule {}
