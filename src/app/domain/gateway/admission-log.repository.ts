import { AdmissionLog } from './admission-log.entity';
import { CreateAdmissionLogCommand } from './create-admission-log.command';

export abstract class AdmissionLogRepository {
  abstract create(command: CreateAdmissionLogCommand): Promise<AdmissionLog>;
  abstract findRecentByUserId(
    userId: bigint,
    limit: number,
  ): Promise<AdmissionLog[]>;
}
