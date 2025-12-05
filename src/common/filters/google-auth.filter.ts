import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/common/dtos/env-config.dto';

@Catch(UnauthorizedException)
export class GoogleAuthExceptionFilter implements ExceptionFilter {
  constructor(private configService: ConfigService<EnvConfig>) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const clientUrl = this.configService.get('CLIENT_URL');
    const message = exception.message || 'Authentication failed';

    response.redirect(
      `${clientUrl}/login?error=${encodeURIComponent(message)}`,
    );
  }
}
