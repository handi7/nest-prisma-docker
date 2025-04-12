import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger("RoleSeeder");

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    this.logger.log("...");
    this.logger.log("Seeding Role: Super Admin");

    const existingRole = await this.prisma.role.findUnique({
      where: { name: "Super Admin" },
      include: {
        permissions: true,
      },
    });

    const allPermissions = await this.prisma.permission.findMany();

    if (existingRole) {
      const existingPermissionIds = new Set(existingRole.permissions.map((p) => p.permissionId));

      const missingPermissions = allPermissions.filter(
        (perm) => !existingPermissionIds.has(perm.id),
      );

      if (missingPermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: missingPermissions.map((perm) => ({
            roleId: existingRole.id,
            permissionId: perm.id,
          })),
          skipDuplicates: true,
        });

        this.logger.log("Super Admin role updated with missing permissions.");
      } else {
        this.logger.log("Super Admin role already complete.");
      }
    } else {
      await this.prisma.role.create({
        data: {
          name: "Super Admin",
          deletedAt: new Date(),
          permissions: {
            createMany: {
              data: allPermissions.map((perm) => ({
                permissionId: perm.id,
              })),
            },
          },
        },
      });

      this.logger.log("Super Admin role created with all permissions.");
    }

    this.logger.log("...");
  }
}
