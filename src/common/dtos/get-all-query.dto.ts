import { IsBooleanString, IsNumberString, IsOptional } from "class-validator";

export class GetAllQueryDto {
  @IsNumberString()
  page: string = "1";

  @IsNumberString()
  @IsOptional()
  limit: string;

  search: string = "";

  sortBy: string;

  @IsBooleanString()
  desc: string = "false";
}
