import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';
import { UserStatus } from '../enum/user-status.enum';

export class UserNotActiveException extends DomainException {
  constructor(userId: bigint, status: UserStatus) {
    super(
      `사용자가 활성 상태가 아닙니다 (status=${status})`,
      'USER_NOT_ACTIVE',
      HttpStatus.FORBIDDEN,
      { userId: userId.toString(), status },
    );
  }
}
