import { Module } from '@nestjs/common';
import { MyDataFacade } from '../../application/mydata.facade';
import { MyDataService } from '../../domain/mydata/mydata.service';
import { UserService } from '../../domain/user/user.service';
import { MyDataController } from './controller/mydata.controller';
import { ParseMyDataCategoryPipe } from './pipe/parse-mydata-category.pipe';

@Module({
  controllers: [MyDataController],
  providers: [
    UserService,
    MyDataService,
    MyDataFacade,
    ParseMyDataCategoryPipe,
  ],
  exports: [MyDataFacade],
})
export class MyDataModule {}
