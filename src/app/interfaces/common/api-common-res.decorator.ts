import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { CommonRes } from "./common-res";

export const ApiCommonRes = <T extends Type<unknown>>(model: T) =>
  applyDecorators(
    ApiExtraModels(CommonRes, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(CommonRes) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  );
