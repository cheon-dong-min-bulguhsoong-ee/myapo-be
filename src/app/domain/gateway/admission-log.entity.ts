import { AdmissionResult } from './admission-result.enum';

export class AdmissionLog {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint,
    public readonly domainId: string,
    public readonly result: AdmissionResult,
    public readonly missing: string[],
    public readonly requester: string | null,
    public readonly requestedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
