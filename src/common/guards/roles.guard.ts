import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Role, User } from "prisma/client";

interface CustomRequest extends Request {
  user: User & { role: Role };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!requiredRoles) {
      return true; // Jika tidak ada role yang dibutuhkan, izinkan akses
    }

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user;

    return requiredRoles.includes(user.role.name);
  }
}
