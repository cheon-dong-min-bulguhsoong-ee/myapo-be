import { User } from '../entity/user.entity';
import { UserStatus } from '../enum/user-status.enum';

export abstract class UserRepository {
  abstract findById(id: bigint): Promise<User | null>;
  abstract findByXrplAddress(xrplAddress: string): Promise<User | null>;
  abstract findByTossCi(tossCi: string): Promise<User | null>;
  abstract updateStatus(id: bigint, status: UserStatus): Promise<User>;
}
