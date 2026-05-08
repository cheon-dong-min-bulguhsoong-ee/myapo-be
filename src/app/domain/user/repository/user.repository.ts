import { User } from "../entity/user.entity";
import { UserWallet } from "../entity/user-wallet.entity";

export interface CreateUserInput {
  email: string;
  name: string;
  nationality: string;
  wallet: {
    verifier: string;
    verifierId: string;
    xrplAddress: string;
    publicKey: string;
  };
}

export abstract class UserRepository {
  abstract findById(id: bigint): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByVerifier(
    verifier: string,
    verifierId: string,
  ): Promise<User | null>;
  abstract findByXrplAddress(xrplAddress: string): Promise<User | null>;
  abstract findWalletByUserId(userId: bigint): Promise<UserWallet | null>;

  abstract create(input: CreateUserInput): Promise<User>;
  abstract update(user: User): Promise<void>;
  abstract reactivate(userId: bigint): Promise<void>;
}
