import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/super-admin.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { Request } from "express";
import { PermissionsEnum } from "generated/prisma/enums";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const check = <T>(key: string): T | undefined => {
      return this.reflector.getAllAndOverride<T>(key, [context.getHandler(), context.getClass()]);
    };

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      return true;
    }

    const requiredRoles = check<string[]>(ROLES_KEY) ?? [];
    if (Boolean(requiredRoles.length) && !requiredRoles.includes(user.role.name)) {
      throw new ForbiddenException("Insufficient role");
    }

    const requiredPermissions = check<PermissionsEnum[]>(PERMISSIONS_KEY) ?? [];
    const userPermissions = user.role.permissions.map((p) => p.permission.name);
    const isPermissed = requiredPermissions.some((perm) => userPermissions.includes(perm));

    if (Boolean(requiredPermissions.length) && !isPermissed) {
      throw new ForbiddenException("Insufficient permission");
    }

    return true;
  }
}
