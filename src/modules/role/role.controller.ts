import { Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ZodBody } from "src/common/decorators/zod-body.decorator";

import { CreateRoleDto, CreateRoleSchema, UpdateRoleDto, UpdateRoleSchema } from "./role.schema";
import { RoleService } from "./role.service";

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Permissions("role.create")
  @Post("role")
  create(@ZodBody(CreateRoleSchema) dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Permissions("role.view")
  @Get("roles")
  findAll() {
    return this.roleService.findAll();
  }

  @Permissions("role.edit")
  @Patch("role/:id")
  update(@Param("id") id: string, @ZodBody(UpdateRoleSchema) dto: UpdateRoleDto) {
    return this.roleService.update(+id, dto);
  }

  @Permissions("role.delete")
  @Delete("role/:id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }
}
