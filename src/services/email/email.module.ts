import { Module, ModuleMetadata } from '@nestjs/common';
import { MailerModule as NodemailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/common/dtos/env-config.dto';
import { EmailService } from './email.service';

const mailerOptions: MailerAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (env: ConfigService<EnvConfig>) => ({
    transport: {
      service: 'Gmail',
      host: env.get<string>('EMAIL_HOST'),
      port: env.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: env.get<string>('EMAIL_USER'),
        pass: env.get<string>('EMAIL_PASSWORD'),
      },
    },
    defaults: {
      from: `"No Reply" <${env.get<string>('EMAIL_USER') || 'noreply@telescope.co.id'}>`,
    },
    template: {
      dir: join(process.cwd(), 'src', 'services', 'email', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
};

const metadata: ModuleMetadata = {
  imports: [NodemailerModule.forRootAsync(mailerOptions)],
  providers: [EmailService],
  exports: [EmailService],
};

@Module(metadata)
export class EmailModule {}
