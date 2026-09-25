import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { EnvConfig } from "../dtos/env-config.dto";

import { applyTags } from "./apply-tags";
import { applyResponseEnvelope } from "./response-envelope";

export const DOCS_PATH = "docs";

/** Docs are on everywhere except production, where SWAGGER_ENABLED has to opt in. */
export function isDocsEnabled(env: ConfigService<EnvConfig>): boolean {
  return Boolean(env.get("SWAGGER_ENABLED")) || env.get("NODE_ENV") !== "production";
}

const DESCRIPTION = `
### Response shape
Handlers never return their value directly — \`ResponseInterceptor\` wraps every success and
\`HttpExceptionFilter\` wraps every failure into the same envelope, with the payload under
\`data\` and pagination under \`meta.pagination\`. The documented schemas reflect that envelope.

### Request schemas
Bodies and query strings are generated from the same Zod schemas that validate them at runtime,
so what you see here is what the service actually accepts.

### Authentication
Every endpoint sits behind a global \`AuthGuard\` and \`PermissionGuard\` unless marked public.
Get an \`access_token\` from \`POST /auth/login\` and paste it via **Authorize**.
`.trim();

export function setupSwagger(app: INestApplication): void {
  const logger = new Logger("Swagger");
  const env = app.get<ConfigService<EnvConfig>>(ConfigService);

  if (!isDocsEnabled(env)) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(process.env.npm_package_name ?? "API")
    .setDescription(DESCRIPTION)
    .setVersion(process.env.npm_package_version ?? "0.0.1")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token, without the `Bearer ` prefix.",
      },
      "bearer",
    )
    .addSecurityRequirements("bearer")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  applyResponseEnvelope(document);
  applyTags(document);

  SwaggerModule.setup(DOCS_PATH, app, document, {
    jsonDocumentUrl: `${DOCS_PATH}/json`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      tryItOutEnabled: true,
    },
  });

  logger.log(`Docs served at /${DOCS_PATH} (spec at /${DOCS_PATH}/json)`);
}
