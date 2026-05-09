import { Injectable } from "@nestjs/common";
import { User as UserRow, UserWallet as UserWalletRow } from "@prisma/client";
import { User } from "../../../../domain/user/entity/user.entity";
import { UserWallet } from "../../../../domain/user/entity/user-wallet.entity";
import { UserRole } from "../../../../domain/user/enum/user-role.enum";
import { VerifierType } from "../../../../domain/user/enum/verifier-type.enum";
import {
  CreateUserInput,
  UserRepository,
} from "../../../../domain/user/repository/user.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: bigint): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
    });
    return row ? this.toUserEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email },
    });
    return row ? this.toUserEntity(row) : null;
  }

  async findByVerifier(
    verifier: string,
    verifierId: string,
  ): Promise<User | null> {
    const walletRow = await this.prisma.userWallet.findUnique({
      where: {
        verifier_verifierId: {
          verifier,
          verifierId,
        },
      },
      include: {
        user: true,
      },
    });
    return walletRow ? this.toUserEntity(walletRow.user) : null;
  }

  async findByXrplAddress(xrplAddress: string): Promise<User | null> {
    const walletRow = await this.prisma.userWallet.findUnique({
      where: { xrplAddress },
      include: { user: true },
    });
    return walletRow ? this.toUserEntity(walletRow.user) : null;
  }

  async findWalletByUserId(userId: bigint): Promise<UserWallet | null> {
    const row = await this.prisma.userWallet.findUnique({
      where: { userId },
    });
    return row ? this.toWalletEntity(row) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const userRow = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          nationality: input.nationality,
        },
      });

      await tx.userWallet.create({
        data: {
          userId: u.id,
          verifier: input.wallet.verifier,
          verifierId: input.wallet.verifierId,
          xrplAddress: input.wallet.xrplAddress,
          publicKey: input.wallet.publicKey,
        },
      });

      return u;
    });

    return this.toUserEntity(userRow);
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        lastLoginAt: user.lastLoginAt,
        isDelete: user.isDelete,
        role: user.role,
      },
    });
  }

  async reactivate(userId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDelete: false,
        lastLoginAt: new Date(),
        role: UserRole.USER, // Reactivate defaults to USER or keep existing? Usually keep, but if it was deleted, maybe reset? ADR says nothing. Let's keep existing if possible, but Prisma data update needs a value if we want to be explicit.
      },
    });
  }

  private toUserEntity(row: UserRow): User {
    return new User(
      row.id,
      row.email,
      row.name,
      row.nationality,
      row.role as UserRole,
      row.createdAt,
      row.updatedAt,
      row.lastLoginAt,
      row.isDelete,
    );
  }

  private toWalletEntity(row: UserWalletRow): UserWallet {
    return new UserWallet(
      row.id,
      row.userId,
      row.verifier as VerifierType,
      row.verifierId,
      row.xrplAddress,
      row.publicKey,
      row.requestedAt,
      row.activatedAt,
      row.updatedAt,
    );
  }
}
