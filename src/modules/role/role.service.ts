import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { PrismaService } from "../../services/prisma/prisma.service";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";
import { toRoleWithPermissions } from "./role.mapper";
import {
  buildOneValidationError,
  buildValidationError,
} from "src/common/helpers/validation-error.helper";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    if (dto.name.toLowerCase() === SUPER_ADMIN_ROLE.toLowerCase()) {
      throw buildOneValidationError<CreateRoleDto>(
        "name",
        `Cannot create ${SUPER_ADMIN_ROLE} role`,
      );
    }

    const role = await this.prisma.role.findFirst({
      where: { name: { equals: dto.name.toLowerCase(), mode: "insensitive" } },
    });

    if (role) {
      throw buildOneValidationError<CreateRoleDto>("name", `${dto.name} role already exist`);
    }

    const permissions = await this.prisma.permission.findMany();

    const invalidPermissions = dto.permissions.filter((id) => {
      return !permissions.some((permission) => permission.id === id);
    });

    if (invalidPermissions.length) {
      const message = `${invalidPermissions.join(", ")} ${invalidPermissions.length > 1 ? "are" : "is"} invalid permission(s)`;
      throw buildOneValidationError<CreateRoleDto>("permissions", message);
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

    return { message: "Role created successfully.", data: toRoleWithPermissions(newRole) };
  }

  findAll() {
    return this.prisma.role.findMany({ where: { deleted_at: null } });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
