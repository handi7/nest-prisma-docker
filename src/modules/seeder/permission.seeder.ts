import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionCategory, PermissionsEnum } from "prisma/client";

@Injectable()
export class PermissionSeeder {
  private readonly logger = new Logger("PermissionSeeder");

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    this.logger.log("...");
    this.logger.log("================= PERMISSION SEEDER START =================");

    const existing = await this.prisma.permission.findMany();
    const existingNames = existing.map((p) => p.name);

    const permissionsToInsert = Object.values(PermissionsEnum)
      .filter((name) => !existingNames.includes(name))
      .map((name) => {
        const label = name
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const [, category] = name.split("_");
        return {
          name,
          label,
          category: category as PermissionCategory,
        };
      });

    if (permissionsToInsert.length > 0) {
      await this.prisma.permission.createMany({
        data: permissionsToInsert,
        skipDuplicates: true,
      });

      this.logger.log(`Inserted ${permissionsToInsert.length} permissions.`);
    } else {
      this.logger.log("No new permissions to insert.");
    }

    this.logger.log("================= PERMISSION SEEDER END =================");
    this.logger.log("...");
  }
}
