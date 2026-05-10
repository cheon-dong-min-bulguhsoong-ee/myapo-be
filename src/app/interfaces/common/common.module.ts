import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ApiExceptionHandler } from "../exception/api-exception-handler";

@Module({
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionHandler }],
})
export class CommonModule {}
