import { Injectable } from '@nestjs/common';
import { User as UserRow } from '@prisma/client';
import { PersonaType } from '../../../../domain/common/enum/persona-type.enum';
import { User } from '../../../../domain/user/entity/user.entity';
import { UserStatus } from '../../../../domain/user/enum/user-status.enum';
import { UserRepository } from '../../../../domain/user/repository/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: bigint): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  private toEntity(row: UserRow): User {
    return new User(
      row.id,
      row.email,
      row.name,
      row.nationality,
      row.personaType as PersonaType,
      row.xrplAddress,
      row.status as UserStatus,
      row.alias,
      row.lastLoginAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
