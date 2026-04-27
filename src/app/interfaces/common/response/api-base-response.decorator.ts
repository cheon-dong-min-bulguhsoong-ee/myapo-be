import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseResponse } from './base-response';

export const ApiBaseResponse = <T extends Type<unknown>>(model: T) =>
  applyDecorators(
    ApiExtraModels(BaseResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponse) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  );
