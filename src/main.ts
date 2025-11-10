import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "./common/dtos/env-config.dto";
import { CustomValidationPipe } from "./common/pipes/validation.pipe";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger("APP");
  const app = await NestFactory.create(AppModule);

  const env = app.get<ConfigService<EnvConfig>>(ConfigService);

  const port = env.get("APP_PORT") || 2000;

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => logger.log(`Running at port: ${port}`));
}
bootstrap();
