import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./modules/prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { SeederModule } from "./modules/seeder/seeder.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => process.env], // Memuat environment variables
    }),
    SeederModule,
    PrismaModule,
    AuthModule,
    RoleModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
