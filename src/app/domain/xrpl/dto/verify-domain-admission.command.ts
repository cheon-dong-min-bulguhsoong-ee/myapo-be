export class VerifyDomainAdmissionCommand {
  constructor(
    public readonly domainId: string,
    public readonly subjectAddress: string,
  ) {}
}
