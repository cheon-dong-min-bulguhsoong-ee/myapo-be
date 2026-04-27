import { Module } from '@nestjs/common';
import { MyDataController } from './controller/mydata.controller';
import { MyDataService } from '../../domain/mydata/service/mydata.service';
import { ParseMyDataCategoryPipe } from './pipe/parse-mydata-category.pipe';

@Module({
  controllers: [MyDataController],
  providers: [
    MyDataService,
    ParseMyDataCategoryPipe,
  ],
  exports: [MyDataService],
})
export class MyDataModule {}
