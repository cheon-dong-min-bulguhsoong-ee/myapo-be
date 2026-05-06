import { User } from '../entity/user.entity';

export abstract class UserRepository {
  abstract findById(id: bigint): Promise<User | null>;
}
