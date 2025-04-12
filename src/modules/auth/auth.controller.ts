import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "src/common/decorators/public.decorator";
import { LoginDto } from "./dto/login.dto";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsEnum } from "prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Permissions(PermissionsEnum.create_user)
  @Post("register")
  create(@Body() registerDto: RegisterDto) {
    return this.authService.create(registerDto);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
