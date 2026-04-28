import { ApiProperty } from '@nestjs/swagger';
import { VerifyAdmissionResult } from '../../../domain/gateway/verify-admission.result';
import { AdmissionResult } from '../../../domain/gateway/admission-result.enum';
import { MyDataCategory } from '../../../domain/mydata/mydata-category.enum';

const MESSAGE_GRANTED = 'User meets all credential requirements';
const MESSAGE_DENIED = 'User is missing required credentials';

export class GatewayVerifyRes {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  public readonly xrplAddress: string;

  @ApiProperty({ enum: AdmissionResult, enumName: 'AdmissionResult' })
  public readonly result: AdmissionResult;

  @ApiProperty({ example: MESSAGE_GRANTED })
  public readonly message: string;

  @ApiProperty({ enum: MyDataCategory, enumName: 'MyDataCategory', isArray: true })
  public readonly missing: MyDataCategory[];

  constructor(
    xrplAddress: string,
    result: AdmissionResult,
    message: string,
    missing: MyDataCategory[],
  ) {
    this.xrplAddress = xrplAddress;
    this.result = result;
    this.message = message;
    this.missing = missing;
  }

  static from(result: VerifyAdmissionResult): GatewayVerifyRes {
    let message: string;
    if (result.result === AdmissionResult.GRANTED) {
      message = MESSAGE_GRANTED;
    } else {
      message = MESSAGE_DENIED;
    }
    return new GatewayVerifyRes(
      result.xrplAddress,
      result.result,
      message,
      result.missing,
    );
  }
}
