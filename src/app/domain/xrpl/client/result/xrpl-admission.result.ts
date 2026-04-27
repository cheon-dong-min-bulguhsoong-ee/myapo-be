export class XrplAdmissionResult {
  constructor(
    public readonly granted: boolean,
    public readonly resultCode: string,
  ) {}
}
