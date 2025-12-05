import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger("RoleSeeder");

  constructor(private readonly prisma: PrismaService) {}

  async run() {
    this.logger.log("...");
    this.logger.log(`Seeding Role: ${SUPER_ADMIN_ROLE}`);

    const existingRole = await this.prisma.role.findUnique({
      where: { name: SUPER_ADMIN_ROLE },
      include: {
        permissions: true,
      },
    });

    const allPermissions = await this.prisma.permission.findMany();

    if (existingRole) {
      const existingPermissionIds = new Set(existingRole.permissions.map((p) => p.permission_id));

      const missingPermissions = allPermissions.filter(
        (perm) => !existingPermissionIds.has(perm.id),
      );

      if (missingPermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: missingPermissions.map((perm) => ({
            role_id: existingRole.id,
            permission_id: perm.id,
          })),
          skipDuplicates: true,
        });

        this.logger.log(`${SUPER_ADMIN_ROLE} role updated with missing permissions.`);
      } else {
        this.logger.log(`${SUPER_ADMIN_ROLE} role already exist with all permissions.`);
      }
    } else {
      await this.prisma.role.create({
        data: {
          name: SUPER_ADMIN_ROLE,
          deleted_at: new Date(),
          permissions: {
            createMany: {
              data: allPermissions.map((perm) => ({
                permission_id: perm.id,
              })),
            },
          },
        },
      });

      this.logger.log(`${SUPER_ADMIN_ROLE} role created with all permissions.`);
    }

    this.logger.log("...");
  }
}
