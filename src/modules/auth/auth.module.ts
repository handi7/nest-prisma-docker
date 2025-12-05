import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/common/dtos/env-config.dto";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "src/common/guards/auth.guard";
import { RedisModule } from "../../services/redis/redis.module";
import { PermissionGuard } from "src/common/guards/permission.guard";
import { EmailModule } from "src/services/email/email.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService<EnvConfig>) => ({
        secret: env.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: env.get("JWT_EXPIRATION_TIME", "10m") },
      }),
    }),
    RedisModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AuthModule {}
