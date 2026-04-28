import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserStatus } from './user-status.enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findByXrplAddress(xrplAddress: string): Promise<User | null> {
    return this.userRepository.findByXrplAddress(xrplAddress);
  }

  updateStatus(id: bigint, status: UserStatus): Promise<User> {
    return this.userRepository.updateStatus(id, status);
  }
}
