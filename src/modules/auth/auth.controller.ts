import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { EnvConfig } from "src/common/dtos/env-config.dto";
import { GoogleAuthExceptionFilter } from "src/common/filters/google-auth.filter";

import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh-token")
  @HttpCode(200)
  refreshToken(@Req() req: Request) {
    return this.authService.refresh(req.user, req.token);
  }

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() _: Request) {}

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @UseFilters(GoogleAuthExceptionFilter)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { access_token, refresh_token, user } = await this.authService.generateSession(req.user);

    const clientUrl = this.configService.get("CLIENT_URL");

    const userString = encodeURIComponent(JSON.stringify(user));

    res.redirect(
      `${clientUrl}/auth/google-callback?access_token=${access_token}&refresh_token=${refresh_token}&user=${userString}`,
    );
  }
  @Public()
  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
