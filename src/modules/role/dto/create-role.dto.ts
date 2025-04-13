import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRoleDto {
  @IsString({ message: "name must be string" })
  @IsNotEmpty({ message: "Role name is required" })
  name: string;

  @IsArray({ message: "permissions must be array" })
  @IsNumber({}, { each: true, message: "Each permission must be a number" })
  @IsNotEmpty({ message: "Permissions is required" })
  permissions: number[];
}
