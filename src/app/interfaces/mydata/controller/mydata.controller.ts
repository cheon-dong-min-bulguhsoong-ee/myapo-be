import { Controller, Get, Param } from '@nestjs/common';
import { MyDataFacade } from '../../../application/mydata.facade';
import { MyDataCategory } from '../../../domain/mydata/mydata-category.enum';
import { CommonRes } from '../../common/common-res';
import { MyDataBundleRes } from '../res/mydata-bundle.res';
import { MyDataSnapshotRes } from '../res/mydata-snapshot.res';
import { ParseMyDataCategoryPipe } from '../pipe/parse-mydata-category.pipe';
import {
  GetMyDataBundleSwaggerApi,
  GetMyDataCategorySwaggerApi,
  MyDataApiTags,
} from '../swagger/mydata.swagger.api';

@MyDataApiTags()
@Controller('api/v1/mydata')
export class MyDataController {
  constructor(private readonly mydataFacade: MyDataFacade) {}

  @Get(':address')
  @GetMyDataBundleSwaggerApi()
  async getBundle(
    @Param('address') address: string,
  ): Promise<CommonRes<MyDataBundleRes>> {
    const result = await this.mydataFacade.getBundleByXrplAddress(address);
    return CommonRes.success(MyDataBundleRes.from(result));
  }

  @Get(':address/:category')
  @GetMyDataCategorySwaggerApi()
  async getCategory(
    @Param('address') address: string,
    @Param('category', ParseMyDataCategoryPipe) category: MyDataCategory,
  ): Promise<CommonRes<MyDataSnapshotRes | null>> {
    const snapshot = await this.mydataFacade.getCategory(address, category);
    if (snapshot === null) {
      return CommonRes.success<MyDataSnapshotRes | null>(null);
    }
    return CommonRes.success<MyDataSnapshotRes | null>(MyDataSnapshotRes.from(snapshot));
  }
}
