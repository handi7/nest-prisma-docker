import { Logger, MiddlewareConsumer, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import PermissionsSeeder from "prisma/seeders/PermissionsSeeder";
import RoleSeeder from "prisma/seeders/RoleSeeder";

import { EnvConfig } from "./common/dtos/env-config.dto";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AuthGuard } from "./common/guards/auth.guard";
import { PermissionGuard } from "./common/guards/permission.guard";
import { GlobalZodInterceptor } from "./common/interceptors/global-zod.interceptor";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { RequestTimerMiddleware } from "./common/middlewares/request-timer.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { UserInviteModule } from "./modules/user-invite/user-invite.module";
import { UserModule } from "./modules/user/user.module";
import { EmailModule } from "./services/email/email.module";
import { PrismaModule } from "./services/prisma/prisma.module";
import { PrismaService } from "./services/prisma/prisma.service";
import { RedisModule } from "./services/redis/redis.module";

@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => process.env],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService<EnvConfig>) => ({
        secret: env.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: env.get("JWT_EXPIRATION_TIME", "10m") },
      }),
    }),

    // Global Modules
    PrismaModule,
    RedisModule,
    EmailModule,

    // Feature Modules
    AuthModule,
    RoleModule,
    UserInviteModule,
    UserModule,
  ],

  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_INTERCEPTOR, useClass: GlobalZodInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(AppModule.name);

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTimerMiddleware).forRoutes("*");
  }

  async onApplicationBootstrap() {
    this.logger.log("Application is bootstrapping...");

    await PermissionsSeeder(this.prisma);
    await RoleSeeder(this.prisma);
  }
}
