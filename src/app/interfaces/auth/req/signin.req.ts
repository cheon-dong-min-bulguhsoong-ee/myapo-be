import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsISO31661Alpha2,
  IsOptional,
  IsString,
} from "class-validator";

export class SignInReq {
  @ApiPropertyOptional({ example: "홍길동" })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional({ example: "KR", description: "ISO 3166-1 alpha-2" })
  @IsISO31661Alpha2()
  @IsOptional()
  readonly nationality?: string;

  @ApiPropertyOptional({ example: "rHb9CJA..." })
  @IsString()
  @IsOptional()
  readonly xrplAddress?: string;

  @ApiPropertyOptional({ example: "02..." })
  @IsString()
  @IsOptional()
  readonly publicKey?: string;
}
