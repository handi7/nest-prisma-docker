import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { genSalt, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { EnvConfig } from "src/common/dtos/env-config.dto";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger("UserSeeder");

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async run() {
    this.logger.log("...");
    this.logger.log("================= USER SEEDER START =================");

    const superAdminName = this.config.get<string>("MAIN_USER_NAME") || "Super Admin";
    const superAdminEmail = this.config.get<string>("MAIN_USER_EMAIL");
    const superAdminPassword = this.config.get<string>("MAIN_USER_PASSWORD");

    if (!superAdminEmail || !superAdminPassword) {
      this.logger.error("MAIN_USER_EMAIL and MAIN_USER_PASSWORD are required in .env file.");
      return;
    }

    // Validasi email pakai regex
    if (!/\S+@\S+\.\S+/.test(superAdminEmail)) {
      this.logger.error("Invalid email format for MAIN_USER_EMAIL.");
      return;
    }

    const superRole = await this.prisma.role.findFirst({
      where: { name: SUPER_ADMIN_ROLE },
    });

    if (!superRole) {
      this.logger.error(`Role "${SUPER_ADMIN_ROLE}" not found. Seeder aborted.`);
      return;
    }

    const superUser = await this.prisma.user.findFirst({
      where: {
        email: superAdminEmail.toLowerCase(),
        roleId: superRole.id,
      },
    });

    if (superUser) {
      this.logger.log("Super Admin user already exists. Super admin email: " + superUser.email);
      return;
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(superAdminPassword, salt);

    await this.prisma.user.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        password: hashedPassword,
        roleId: superRole.id,
      },
    });

    this.logger.log("Super Admin user created. Email: " + superAdminEmail);

    this.logger.log("================= USER SEEDER END =================");
    this.logger.log("...");
  }
}
