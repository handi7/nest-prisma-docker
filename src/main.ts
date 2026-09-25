import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { EnvConfig } from "./common/dtos/env-config.dto";
import { setupSwagger } from "./common/swagger/swagger.config";

import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("APP");
  const app = await NestFactory.create(AppModule);

  const env = app.get<ConfigService<EnvConfig>>(ConfigService);

  const port = env.get("APP_PORT");
  const allowedOrigins = resolveCorsOrigins(env);

  if (allowedOrigins.length === 0) {
    logger.warn("No CORS origins configured: every cross-origin browser request will be refused.");
  }

  app.enableCors({ origin: allowedOrigins });

  setupSwagger(app);

  await app.listen(port, () => logger.log(`Running at port: ${port}`));
}

/**
 * `APP_ORIGINS` (comma-separated) plus the origin of `CLIENT_URL`.
 *
 * A browser's `Origin` header is scheme + host + port and never carries a path, so `CLIENT_URL`
 * is reduced to its origin: appended as-is, a value like `https://example.com/app` would never
 * match and silently allow nothing.
 */
function resolveCorsOrigins(env: ConfigService<EnvConfig>): string[] {
  const origins = env
    .get<string>("APP_ORIGINS", "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const clientUrl = env.get<string>("CLIENT_URL");
  if (URL.canParse(clientUrl)) {
    origins.push(new URL(clientUrl).origin);
  }

  return [...new Set(origins)];
}

bootstrap();
