import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../../../domain/common/enum/mydata-category.enum';

@Injectable()
export class ParseMyDataCategoryPipe
  implements PipeTransform<string, MyDataCategory>
{
  transform(value: string): MyDataCategory {
    const matched = MYDATA_CATEGORIES.find((category) => category === value);
    if (matched === undefined) {
      throw new BadRequestException(
        `category must be one of ${MYDATA_CATEGORIES.join(',')}`,
      );
    }
    return matched;
  }
}
