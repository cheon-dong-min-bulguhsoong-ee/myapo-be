import { PersonaType } from '../../common/enum/persona-type.enum';
import { UserStatus } from '../enum/user-status.enum';

export class User {
  constructor(
    public readonly id: bigint,
    public readonly email: string,
    public readonly name: string,
    public readonly nationality: string,
    public readonly personaType: PersonaType,
    public readonly xrplAddress: string,
    public readonly status: UserStatus,
    public readonly alias: string | null,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
