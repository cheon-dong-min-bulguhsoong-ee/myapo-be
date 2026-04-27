import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(
      `사용자를 찾을 수 없습니다: ${identifier}`,
      'USER_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { identifier },
    );
  }
}
