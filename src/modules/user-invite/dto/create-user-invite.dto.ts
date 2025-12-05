import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class CreateUserInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsNotEmpty()
  role_id: number;
}
