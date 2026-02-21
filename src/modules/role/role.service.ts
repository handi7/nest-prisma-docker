import { Injectable } from "@nestjs/common";
import { SUPER_ADMIN_ROLE } from "src/common/decorators/super-admin.decorator";
import { buildOneValidationError } from "src/common/helpers/validation-error.helper";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

import { toRoleWithPermissions } from "./role.mapper";
import { RoleRepository } from "./role.repository";

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async create(dto: CreateRoleDto) {
    if (dto.name.toLowerCase() === SUPER_ADMIN_ROLE.toLowerCase()) {
      throw buildOneValidationError<CreateRoleDto>(
        "name",
        `Cannot create ${SUPER_ADMIN_ROLE} role`,
      );
    }

    const role = await this.roleRepo.findByName({ equals: dto.name, mode: "insensitive" });

    if (role) {
      throw buildOneValidationError<CreateRoleDto>("name", `${dto.name} role already exist`);
    }

    const permissions = await this.roleRepo.findManyPermissions();

    const invalidPermissions = dto.permissions.filter((id) => {
      return !permissions.some((permission) => permission.id === id);
    });

    if (invalidPermissions.length) {
      const message = `${invalidPermissions.join(", ")} ${invalidPermissions.length > 1 ? "are" : "is"} invalid permission(s)`;
      throw buildOneValidationError<CreateRoleDto>("permissions", message);
    }

    const newRole = await this.roleRepo.create(
      {
        name: dto.name,
        permissions: {
          create: dto.permissions.map((id) => ({ permission: { connect: { id } } })),
        },
      },
      { include: { permissions: { include: { permission: true } } } },
    );

    return { message: "Role created successfully.", data: toRoleWithPermissions(newRole) };
  }

  findAll() {
    return this.roleRepo.findMany({ where: { deleted_at: null } });
  }

  update(id: number, _: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
