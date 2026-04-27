import { AdmissionResult } from '../../enum/admission-result.enum';

export class CreateAdmissionLogCommand {
  constructor(
    public readonly userId: bigint,
    public readonly domainId: string,
    public readonly result: AdmissionResult,
    public readonly missing: string[],
    public readonly requester: string | null = null,
  ) {}
}
