import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { PermissionsEnum } from "prisma/client";

type AuthorizedRequest = Express.Request & { authorization: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const check = <T>(key: string): T | undefined => {
      return this.reflector.getAllAndOverride<T>(key, [context.getHandler(), context.getClass()]);
    };

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request.headers); // Bearer token

    if (check<boolean>(IS_PUBLIC_KEY) && !token) return true;
    if (!token) throw new UnauthorizedException("Token is required");

    try {
      // Verify JWT
      const payload = await this.verifyJwt(token);
      const user = await this.prisma.user.findFirst({
        where: { id: payload.id, email: payload.email },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });
      if (!user) throw new UnauthorizedException("User not found");

      // Cek Role jika ada
      const requiredRoles = check<string[]>(ROLES_KEY);
      if (requiredRoles && !requiredRoles.includes(user.role.name)) {
        throw new ForbiddenException("Insufficient role");
      }

      // Cek Permission jika ada
      const requiredPermissions = check<PermissionsEnum[]>(PERMISSIONS_KEY);
      const userPermissions = user.role.permissions.map((p) => p.permission.name);
      if (
        requiredPermissions &&
        !requiredPermissions.some((perm) => userPermissions.includes(perm))
      ) {
        throw new ForbiddenException("Insufficient permission");
      }

      request["user"] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || "Unauthorized");
    }
  }

  private async verifyJwt(token: string) {
    return this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
  }

  private extractTokenFromHeader(headers: AuthorizedRequest): string | undefined {
    const [type, token] = headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
