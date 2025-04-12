import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Name is required" })
  name: string;

  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @IsNumber({}, { message: "role_id must be number" })
  @IsNotEmpty({ message: "Role is required" })
  role_id: number;
}
