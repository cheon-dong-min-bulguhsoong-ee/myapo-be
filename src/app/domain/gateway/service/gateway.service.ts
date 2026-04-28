import { Injectable } from '@nestjs/common';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../../common/enum/mydata-category.enum';
import { AdmissionResult } from '../enum/admission-result.enum';

@Injectable()
export class GatewayService {
  computeMissing(activeCategories: MyDataCategory[]): MyDataCategory[] {
    const owned = new Set<MyDataCategory>();
    for (const category of activeCategories) {
      owned.add(category);
    }
    const missing: MyDataCategory[] = [];
    for (const category of MYDATA_CATEGORIES) {
      if (!owned.has(category)) {
        missing.push(category);
      }
    }
    return missing;
  }

  decideResult(
    isUserActive: boolean,
    missing: MyDataCategory[],
  ): AdmissionResult {
    if (!isUserActive) {
      return AdmissionResult.DENIED;
    }
    if (missing.length > 0) {
      return AdmissionResult.DENIED;
    }
    return AdmissionResult.GRANTED;
  }
}
