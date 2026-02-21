import { Logger, MiddlewareConsumer, Module, OnApplicationBootstrap } from "@nestjs/common";
import { PrismaService } from "./services/prisma/prisma.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "./services/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { RedisModule } from "./services/redis/redis.module";
import { UserInviteModule } from "./modules/user-invite/user-invite.module";
import { UserModule } from "./modules/user/user.module";
import { RequestTimerMiddleware } from "./common/middlewares/request-timer.middleware";
import PermissionsSeeder from "prisma/seeders/PermissionsSeeder";
import RoleSeeder from "prisma/seeders/RoleSeeder";
import { EmailModule } from "./services/email/email.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./common/guards/auth.guard";
import { PermissionGuard } from "./common/guards/permission.guard";
import { JwtModule } from "@nestjs/jwt";
import { EnvConfig } from "./common/dtos/env-config.dto";

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
