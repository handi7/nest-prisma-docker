import { Module } from "@nestjs/common";
import { PrismaService } from "./services/prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { SeederModule } from "./services/seeder/seeder.module";
import { PrismaModule } from "./services/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { RedisModule } from "./services/redis/redis.module";
import { PermissionModule } from "./services/permission/permission.module";
import { UserInviteModule } from "./modules/user-invite/user-invite.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => process.env],
    }),
    SeederModule,
    PrismaModule,
    AuthModule,
    RoleModule,
    RedisModule,
    PermissionModule,
    UserInviteModule,
    UserModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
