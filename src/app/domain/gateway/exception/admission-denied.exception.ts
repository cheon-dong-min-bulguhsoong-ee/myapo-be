import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';
import { MyDataCategory } from '../../mydata/enum/mydata-category.enum';

export class AdmissionDeniedException extends DomainException {
  constructor(missing: MyDataCategory[]) {
    super(
      `도메인 입장 자격이 부족합니다`,
      'ADMISSION_DENIED',
      HttpStatus.FORBIDDEN,
      { missing },
    );
  }
}
