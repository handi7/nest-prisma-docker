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
import { ROLES_KEY } from "../decorators/super-admin.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { PrismaService } from "src/services/prisma/prisma.service";
import { PermissionsEnum } from "prisma/client";
import { RedisService } from "src/services/redis/redis.service";
import { RedisSession } from "src/common/dtos/redis-session.dto";

type AuthorizedRequest = Express.Request & { authorization: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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
      // 1. Verify token
      const payload = await this.verifyJwt(token);

      const userId = payload.id ?? payload.sub;
      if (!userId) throw new UnauthorizedException("Invalid token payload");

      // 2. Cek token di Redis
      const redisSession = await this.redis.get(`session:${userId}`);
      if (!redisSession) throw new UnauthorizedException("Session not found");

      const { access_token, refresh_token }: RedisSession = JSON.parse(redisSession);

      if (access_token !== token && refresh_token !== token) {
        throw new UnauthorizedException("Session expired or replaced");
      }

      // 3. Ambil user dari DB
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });
      if (!user) throw new UnauthorizedException("User not found");

      // 4. Cek role & permission
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

      request["user"] = user;
      request["token"] = token;
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
