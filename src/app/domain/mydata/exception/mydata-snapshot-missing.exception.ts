import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';
import { MyDataCategory } from '../enum/mydata-category.enum';

export class MyDataSnapshotMissingException extends DomainException {
  constructor(userId: bigint, missing: MyDataCategory[]) {
    super(
      `필요한 마이데이터 카테고리가 누락되었습니다`,
      'MYDATA_SNAPSHOT_MISSING',
      HttpStatus.UNPROCESSABLE_ENTITY,
      { userId: userId.toString(), missing },
    );
  }
}
