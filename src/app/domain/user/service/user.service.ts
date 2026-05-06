import {Injectable} from '@nestjs/common';
import {DomainError} from '../../common/error/domain.error';
import {ErrorCode} from '../../common/error/error-code';
import {User} from '../entity/user.entity';
import {UserStatus} from '../enum/user-status.enum';
import {UserRepository} from '../repository/user.repository';

/**
 * 사용자 도메인 서비스.
 * 다른 컨텍스트의 facade 는 이 서비스를 통해서만 사용자 정보를 가져온다 — repository 직접 참조 금지.
 */
@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {
    }

    /**
     * 활성 사용자 조회. 없거나 비활성이면 DomainError throw.
     * 호출 측은 user 가 항상 존재 + ACTIVE 라고 가정하고 사용 가능.
     */
    async getActive(id: bigint): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (user === null) {
            throw new DomainError(ErrorCode.User.USER_NOT_FOUND, {
                userId: id.toString(),
            });
        }
        if (user.status !== UserStatus.ACTIVE) {
            throw new DomainError(ErrorCode.User.USER_NOT_ACTIVE, {
                userId: id.toString(),
                status: user.status,
            });
        }
        return user;
    }
}
