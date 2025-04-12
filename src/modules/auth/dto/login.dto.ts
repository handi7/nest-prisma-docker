import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
