import { MyDataCategory } from '../../common/enum/mydata-category.enum';

export enum IssuerCode {
  MOJ = 'MOJ',
  NTS_INCOME = 'NTS_INCOME',
  NTS_TAX = 'NTS_TAX',
  NHIS = 'NHIS',
  TOSS_ARC = 'TOSS_ARC',
}

export const ISSUER_CODES = Object.values(IssuerCode);

export const ISSUER_CATEGORY_MAP: Record<IssuerCode, MyDataCategory> = {
  [IssuerCode.MOJ]: MyDataCategory.VISA_STAY,
  [IssuerCode.NTS_INCOME]: MyDataCategory.INCOME_CERT,
  [IssuerCode.NTS_TAX]: MyDataCategory.TAX_CLEAR,
  [IssuerCode.NHIS]: MyDataCategory.HEALTH_INS,
  [IssuerCode.TOSS_ARC]: MyDataCategory.KYC_TOSS,
};