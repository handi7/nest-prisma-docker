import { Injectable } from "@nestjs/common";
import { Permission, Prisma, Role } from "generated/prisma/client";
import { BaseRepository } from "src/common/base/base.repository";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class RoleRepository extends BaseRepository<
  PrismaService["role"],
  Role,
  Prisma.RoleWhereInput,
  Prisma.RoleWhereUniqueInput,
  Prisma.RoleCreateInput,
  Prisma.RoleUpdateInput,
  Prisma.RoleOrderByWithRelationInput,
  Prisma.RoleInclude,
  Prisma.RoleSelect
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.role);
  }

  findByName(name: Prisma.RoleFindFirstArgs["where"]["name"]): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name },
    });
  }

  findManyPermissions(args?: Prisma.PermissionFindManyArgs): Promise<Permission[]> {
    return this.prisma.permission.findMany(args);
  }
}
