import { PrismaClient } from "generated/prisma/client";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";

async function RoleSeeder(prisma: PrismaClient) {
  const existingRole = await prisma.role.findUnique({
    where: { name: SUPER_ADMIN_ROLE },
    include: {
      permissions: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  if (existingRole) {
    const existingPermissionIds = new Set(existingRole.permissions.map((p) => p.permission_id));

    const missingPermissions = allPermissions.filter((perm) => !existingPermissionIds.has(perm.id));

    if (missingPermissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: missingPermissions.map((perm) => ({
          role_id: existingRole.id,
          permission_id: perm.id,
        })),
        skipDuplicates: true,
      });

      console.log(`${SUPER_ADMIN_ROLE} role updated with missing permissions.`);
    } else {
      console.log(`${SUPER_ADMIN_ROLE} role already exist with all permissions.`);
    }
  } else {
    await prisma.role.create({
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

    console.log(`${SUPER_ADMIN_ROLE} role created with all permissions.`);
  }
}

export default RoleSeeder;
