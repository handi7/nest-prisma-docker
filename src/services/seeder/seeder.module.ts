import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SeederService } from "./seeder.service";
import { PermissionSeeder } from "./permission.seeder";
import { RoleSeeder } from "./role.seeder";
import { UserSeeder } from "./user.seeder";

@Module({
  imports: [PrismaModule],
  providers: [SeederService, PermissionSeeder, RoleSeeder, UserSeeder],
})
export class SeederModule {}
