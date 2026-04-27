import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MyDataService } from '../../../domain/mydata/service/mydata.service';
import { MyDataCategory } from '../../../domain/mydata/enum/mydata-category.enum';
import { BaseResponse } from '../../common/response/base-response';
import { ApiBaseResponse } from '../../common/response/api-base-response.decorator';
import { MyDataBundleResponse } from '../dto/response/mydata-bundle.response';
import { MyDataSnapshotResponse } from '../dto/response/mydata-snapshot.response';
import { ParseMyDataCategoryPipe } from '../pipe/parse-mydata-category.pipe';

@ApiTags('MyData')
@Controller('api/v1/mydata')
export class MyDataController {
  constructor(
    private readonly mydataService: MyDataService,
  ) {}

  @Get(':address')
  @ApiOperation({
    summary: '사용자 마이데이터 번들 조회',
    description: 'xrplAddress 기준으로 5종 마이데이터 스냅샷 번들을 반환합니다.',
  })
  @ApiParam({ name: 'address', description: 'XRPL 주소', example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @ApiBaseResponse(MyDataBundleResponse)
  @ApiResponse({ status: 404, description: 'USER_NOT_FOUND', type: BaseResponse })
  async getBundle(
    @Param('address') address: string,
  ): Promise<BaseResponse<MyDataBundleResponse>> {
    const result = await this.mydataService.getBundleByXrplAddress(address);
    return BaseResponse.success(MyDataBundleResponse.from(result));
  }

  @Get(':address/:category')
  @ApiOperation({
    summary: '특정 카테고리 마이데이터 스냅샷 조회',
    description: '특정 카테고리(VISA_STAY 등) 단일 스냅샷을 반환합니다. 해당 카테고리 데이터가 없으면 data: null 을 반환합니다.',
  })
  @ApiParam({ name: 'address', description: 'XRPL 주소', example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @ApiParam({ name: 'category', description: '마이데이터 카테고리', enum: MyDataCategory, enumName: 'MyDataCategory' })
  @ApiBaseResponse(MyDataSnapshotResponse)
  @ApiResponse({ status: 404, description: 'USER_NOT_FOUND', type: BaseResponse })
  async getCategory(
    @Param('address') address: string,
    @Param('category', ParseMyDataCategoryPipe) category: MyDataCategory,
  ): Promise<BaseResponse<MyDataSnapshotResponse | null>> {
    const snapshot = await this.mydataService.getCategory(address, category);
    if (snapshot === null) {
      return BaseResponse.success<MyDataSnapshotResponse | null>(null);
    }
    return BaseResponse.success<MyDataSnapshotResponse | null>(MyDataSnapshotResponse.from(snapshot));
  }
}
