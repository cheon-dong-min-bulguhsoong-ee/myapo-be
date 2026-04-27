import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';
import { MyDataCategory } from '../../mydata/enum/mydata-category.enum';

export class CredentialIssuanceFailedException extends DomainException {
  constructor(category: MyDataCategory, reason: string) {
    super(
      `Credential 발행에 실패했습니다 (${category})`,
      'CREDENTIAL_ISSUANCE_FAILED',
      HttpStatus.BAD_GATEWAY,
      { category, reason },
    );
  }
}
