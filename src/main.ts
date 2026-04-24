import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { EnvConfig } from "./common/dtos/env-config.dto";

import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("APP");
  const app = await NestFactory.create(AppModule);

  const env = app.get<ConfigService<EnvConfig>>(ConfigService);

  const port = env.get("APP_PORT");
  const clientUrl = env.get<string>("CLIENT_URL");
  const origin = env.get<string>("ORIGIN");
  const allowedOrigins = [...origin.split(","), clientUrl];

  app.enableCors({ origin: allowedOrigins });

  await app.listen(port, () => logger.log(`Running at port: ${port}`));
}

bootstrap();
