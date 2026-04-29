import {ApiProperty} from '@nestjs/swagger';
import {
    ArrayContains,
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsEnum,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import {IssuerCode} from '../../../domain/issuer/enum/issuer-code.enum';

export class RequestCredentialReq {
    @ApiProperty({example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'})
    @IsString()
    @MinLength(25)
    @MaxLength(35)
    xrplAddress!: string;

    @ApiProperty({
        enum: IssuerCode,
        enumName: 'IssuerCode',
        isArray: true,
        example: [
            IssuerCode.MOJ,
            IssuerCode.NTS_INCOME,
            IssuerCode.NTS_TAX,
            IssuerCode.NHIS,
            IssuerCode.TOSS_ARC,
        ],
        description:
            '발급을 요청할 출처 목록. TOSS_ARC(KYC) 는 필수. 나머지 4종은 0개 이상 선택 (중복 불가).',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayUnique()
    @IsEnum(IssuerCode, {each: true})
    @ArrayContains([IssuerCode.TOSS_ARC], {
        message: 'KYC(TOSS_ARC) 발급은 필수입니다.',
    })
    issuers!: IssuerCode[];
}