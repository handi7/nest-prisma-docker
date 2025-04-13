import { Controller, Get } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsEnum } from "prisma/client";

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Permissions(PermissionsEnum.view_permission)
  @Get("permissions")
  findAll() {
    return this.permissionService.findAll();
  }
}
