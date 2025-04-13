import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsEnum } from "prisma/client";

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Permissions(PermissionsEnum.create_role)
  @Post("role")
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Permissions(PermissionsEnum.view_role)
  @Get("roles")
  findAll() {
    return this.roleService.findAll();
  }

  @Permissions(PermissionsEnum.edit_role)
  @Patch("role/:id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Permissions(PermissionsEnum.delete_role)
  @Delete("role/:id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }
}
