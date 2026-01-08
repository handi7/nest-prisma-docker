import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { Permission, Prisma, Role } from "generated/prisma/client";

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create<T extends Role>(
    data: Prisma.RoleCreateInput,
    args?: Omit<Prisma.RoleCreateArgs, "data">,
  ): Promise<T> {
    const role = await this.prisma.role.create({ ...args, data });

    return role as T;
  }

  update(
    id: number,
    data: Prisma.RoleUpdateInput,
    options?: Omit<Prisma.RoleUpdateArgs, "where" | "data">,
  ): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
      ...options,
    });
  }

  findById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  findByName(name: Prisma.RoleFindFirstArgs["where"]["name"]): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name },
    });
  }

  findMany(args: Prisma.RoleFindManyArgs): Promise<Role[]> {
    return this.prisma.role.findMany(args);
  }

  findManyPermissions(args?: Prisma.PermissionFindManyArgs): Promise<Permission[]> {
    return this.prisma.permission.findMany(args);
  }

  count(where: Prisma.RoleWhereInput): Promise<number> {
    return this.prisma.role.count({ where });
  }

  delete(id: number): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }
}
