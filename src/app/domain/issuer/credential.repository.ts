import { MyDataCategory } from '../common/mydata-category.enum';
import { Credential } from './credential.entity';
import { CreateCredentialCommand } from './create-credential.command';

export abstract class CredentialRepository {
  abstract create(command: CreateCredentialCommand): Promise<Credential>;
  abstract findActiveByUserId(userId: bigint): Promise<Credential[]>;
  abstract findActiveByUserIdAndCategory(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<Credential | null>;
  abstract supersedeActive(
    userId: bigint,
    category: MyDataCategory,
  ): Promise<number>;
}
