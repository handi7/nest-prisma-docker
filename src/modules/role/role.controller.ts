import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsEnum } from "prisma/client";

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post("role")
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Permissions(PermissionsEnum.view_role)
  @Get("roles")
  findAll() {
    return this.roleService.findAll();
  }

  @Get("role/:id")
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch("role/:id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete("role/:id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }
}
