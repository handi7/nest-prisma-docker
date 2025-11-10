import { IsBooleanString, IsNumberString, IsOptional } from "class-validator";

export class GetAllQuery {
  @IsNumberString()
  page: string = "1";

  @IsNumberString()
  @IsOptional()
  size: string;

  s: string = "";

  sortBy: string;

  @IsBooleanString()
  desc: string = "false";
}
