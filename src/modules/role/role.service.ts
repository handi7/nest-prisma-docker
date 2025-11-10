import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { PrismaService } from "../../services/prisma/prisma.service";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    try {
      if (dto.name.toLowerCase() === SUPER_ADMIN_ROLE.toLowerCase()) {
        throw new BadRequestException(`Cannot create ${SUPER_ADMIN_ROLE} role`);
      }

      const role = await this.prisma.role.findFirst({
        where: { name: { equals: dto.name.toLowerCase(), mode: "insensitive" } },
      });

      if (role) {
        throw new ConflictException(`${dto.name} role already exist`);
      }

      const permissions = await this.prisma.permission.findMany();

      const invalidPermissions = dto.permissions.filter((id) => {
        return !permissions.some((permission) => permission.id === id);
      });

      if (invalidPermissions.length) {
        throw new BadRequestException(
          `${invalidPermissions.join(", ")} ${invalidPermissions.length > 1 ? "are" : "is"} invalid permission(s)`,
        );
      }

      const newRole = await this.prisma.role.create({
        data: {
          name: dto.name,
          permissions: {
            create: dto.permissions.map((id) => ({ permission: { connect: { id } } })),
          },
        },
        include: { permissions: { include: { permission: true } } },
      });

      return newRole;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  findAll() {
    return this.prisma.role.findMany({ where: { deletedAt: null } });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
