import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/common/dtos/env-config.dto';
import { User } from 'src/types/User';

@Injectable()
export class EmailService {
  private readonly clientOrigin: string;

  constructor(
    private mailerService: MailerService,
    private readonly env: ConfigService<EnvConfig>,
  ) {
    this.clientOrigin = this.env.get<string>('CLIENT_URL', '');
  }

  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.clientOrigin}/verify/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Telescope" <noreply@telescope.com>', // override default from
      subject: 'Welcome to Telescope! Email Verification',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        name: user.name,
        url,
      },
    });
  }

  async sendUserInvite(email: string, token: string) {
    const url = `${this.clientOrigin}/invite/${token}`;

    await this.mailerService.sendMail({
      to: email,
      from: '"Telescope" <noreply@telescope.com>', // override default from
      subject: 'Telescope Invitation',
      template: './invite', // `.hbs` extension is appended automatically
      context: {
        url,
      },
    });
  }

  async sendResetPassword(user: User, token: string) {
    const url = `${this.clientOrigin}/auth/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Telescope" <noreply@telescope.com>', // override default from
      subject: 'Reset Password - Telescope',
      template: './reset-password', // `.hbs` extension is appended automatically
      context: {
        name: user.name,
        url,
      },
    });
  }
}
