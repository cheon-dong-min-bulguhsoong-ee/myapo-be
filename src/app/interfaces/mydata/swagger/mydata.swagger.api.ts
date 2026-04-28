import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MyDataCategory } from '../../../domain/mydata/mydata-category.enum';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CommonRes } from '../../common/common-res';
import { MyDataBundleRes } from '../res/mydata-bundle.res';
import { MyDataSnapshotRes } from '../res/mydata-snapshot.res';

export const MyDataApiTags = () => ApiTags('MyData');

export const GetMyDataBundleSwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '사용자 마이데이터 번들 조회',
      description: 'xrplAddress 기준으로 5종 마이데이터 스냅샷 번들을 반환합니다.',
    }),
    ApiParam({
      name: 'address',
      description: 'XRPL 주소',
      example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    }),
    ApiCommonRes(MyDataBundleRes),
    ApiResponse({ status: 404, description: 'ERR_USER_NOT_FOUND', type: CommonRes }),
  );

export const GetMyDataCategorySwaggerApi = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 카테고리 마이데이터 스냅샷 조회',
      description:
        '특정 카테고리(VISA_STAY 등) 단일 스냅샷을 반환합니다. 해당 카테고리 데이터가 없으면 data: null 을 반환합니다.',
    }),
    ApiParam({
      name: 'address',
      description: 'XRPL 주소',
      example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    }),
    ApiParam({
      name: 'category',
      description: '마이데이터 카테고리',
      enum: MyDataCategory,
      enumName: 'MyDataCategory',
    }),
    ApiCommonRes(MyDataSnapshotRes),
    ApiResponse({ status: 404, description: 'ERR_USER_NOT_FOUND', type: CommonRes }),
  );
