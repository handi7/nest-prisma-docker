import { MailerOptions, MailerModule as NodemailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { MailerAsyncOptions } from "@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface";
import { Global, Module, ModuleMetadata } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { EnvConfig } from "src/common/dtos/env-config.dto";

import { EmailService } from "./email.service";

const mailerOptions: MailerAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (env: ConfigService<EnvConfig>): Promise<MailerOptions> => {
    const service = env.get<string>("EMAIL_SERVICE");

    const options: MailerOptions = {
      transport: {
        host: env.get<string>("EMAIL_HOST"),
        port: env.get<number>("EMAIL_PORT"),
        secure: env.get<boolean>("EMAIL_SECURE"),
        ignoreTLS: env.get<boolean>("EMAIL_IGNORE_TLS"),
        auth: {
          user: env.get<string>("EMAIL_USER"),
          pass: env.get<string>("EMAIL_PASSWORD"),
        },
      },
      defaults: {
        from: `"No Reply" <${env.get<string>("EMAIL_USER") || "noreply@telescope.co.id"}>`,
      },
      template: {
        dir: join(__dirname, "templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };

    if (service) {
      options.transport.service = service;
    }

    return options;
  },
};

const metadata: ModuleMetadata = {
  imports: [NodemailerModule.forRootAsync(mailerOptions)],
  providers: [EmailService],
  exports: [EmailService],
};

@Global()
@Module(metadata)
export class EmailModule {}
