import { Injectable } from '@nestjs/common';
import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { AdmissionLog } from '../entity/admission-log.entity';
import { AdmissionLogRepository } from '../repository/admission-log.repository';
import { AdmissionResult } from '../enum/admission-result.enum';
import { CreateAdmissionLogCommand } from '../dto/create-admission-log.command';

@Injectable()
export class AdmissionLogService {
  constructor(
    private readonly admissionLogRepository: AdmissionLogRepository,
  ) {}

  createVerificationLog(
    userId: bigint,
    domainId: string,
    result: AdmissionResult,
    missing: MyDataCategory[],
    requester: string | null,
  ): Promise<AdmissionLog> {
    return this.admissionLogRepository.create(
      new CreateAdmissionLogCommand(
        userId,
        domainId,
        result,
        missing,
        requester,
      ),
    );
  }
}
