import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';

export class ComplianceFreezeFailedException extends DomainException {
  constructor(reason: string) {
    super(
      `Deep Freeze 트랜잭션 처리에 실패했습니다`,
      'COMPLIANCE_FREEZE_FAILED',
      HttpStatus.BAD_GATEWAY,
      { reason },
    );
  }
}
