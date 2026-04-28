import { Injectable } from '@nestjs/common';
import { MyDataCategory } from '../common/mydata-category.enum';
import { Credential } from './credential.entity';
import { CredentialRepository } from './credential.repository';
import { CreateCredentialCommand } from './create-credential.command';

@Injectable()
export class CredentialService {
  constructor(private readonly credentialRepository: CredentialRepository) {}

  create(command: CreateCredentialCommand): Promise<Credential> {
    return this.credentialRepository.create(command);
  }

  findActiveByUserId(userId: bigint): Promise<Credential[]> {
    return this.credentialRepository.findActiveByUserId(userId);
  }

  findActiveByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<Credential | null> {
    return this.credentialRepository.findActiveByUserIdAndCategory(
      userId,
      category,
    );
  }

  supersedeActive(userId: bigint, category: MyDataCategory): Promise<number> {
    return this.credentialRepository.supersedeActive(userId, category);
  }
}
