import { Injectable } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import { MyDataSnapshot } from '../domain/mydata/entity/mydata-snapshot.entity';
import { MyDataCategory } from '../domain/common/enum/mydata-category.enum';
import { MyDataBundleResult } from '../domain/mydata/dto/mydata-bundle.result';
import { MyDataService } from '../domain/mydata/service/mydata.service';
import { User } from '../domain/user/entity/user.entity';
import { UserService } from '../domain/user/service/user.service';

@Injectable()
export class MyDataFacade {
  constructor(
    private readonly userService: UserService,
    private readonly mydataService: MyDataService,
  ) {}

  async getBundleByXrplAddress(
    xrplAddress: string,
  ): Promise<MyDataBundleResult> {
    const user = await this.loadUser(xrplAddress);
    return this.mydataService.getLatestBundle(user.id, user.xrplAddress);
  }

  async getCategory(
    xrplAddress: string,
    category: MyDataCategory,
  ): Promise<MyDataSnapshot | null> {
    const user = await this.loadUser(xrplAddress);
    return this.mydataService.findLatestByUserIdAndCategory(user.id, category);
  }

  private async loadUser(xrplAddress: string): Promise<User> {
    const user = await this.userService.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new ApiException(ExceptionCode.User.USER_NOT_FOUND, {
        xrplAddress,
      });
    }
    return user;
  }
}
