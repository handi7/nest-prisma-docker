import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Permission, Role, User } from "prisma/client";

interface CustomRequest extends Request {
  user: User & { role: Role & { permissions: Permission[] } };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>("permissions", context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user;

    return user?.role.permissions.some((permission) => {
      return requiredPermissions.includes(permission.name);
    });
  }
}
