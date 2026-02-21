import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Permissions } from "src/common/decorators/permissions.decorator";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

import { RoleService } from "./role.service";

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Permissions("role.create")
  @Post("role")
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Permissions("role.view")
  @Get("roles")
  findAll() {
    return this.roleService.findAll();
  }

  @Permissions("role.edit")
  @Patch("role/:id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Permissions("role.delete")
  @Delete("role/:id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }
}
