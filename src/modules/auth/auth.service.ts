import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { compareSync, genSalt, hash } from "bcryptjs";
import { PrismaService } from "../../services/prisma/prisma.service";
import { RedisService } from "../../services/redis/redis.service";
import { RedisSession } from "src/common/dtos/redis-session.dto";
import { User } from "src/types/User";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../../services/email/email.service";
import { toRoleWithPermissionNames } from "../role/role.mapper";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: { equals: dto.email.toLowerCase(), mode: "insensitive" },
        },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      });

      if (!user || !compareSync(dto.password, user.password)) {
        throw new BadRequestException("Invalid email or password");
      }

      return this.generateSession(user);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async validateGoogleUser(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.toLowerCase(), mode: "insensitive" },
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Account not registered");
    }

    return user;
  }

  async generateSession(user: any) {
    const { password: _, ...userData } = user;

    const jwtPayload = {
      id: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    };

    const access_token = this.jwtService.sign(jwtPayload, {
      expiresIn: "10h",
    });

    const refresh_token = this.jwtService.sign(
      { ...jwtPayload, isRefresh: true },
      { expiresIn: "7d" },
    );

    const redisValue = JSON.stringify({
      access_token,
      refresh_token,
      user: userData,
    });
    const redisExp = 60 * 60 * 24 * 7; // 7 hari TTL
    await this.redis.set(`session:${user.id}`, redisValue, redisExp);

    return {
      access_token,
      refresh_token,
      user: { ...userData, role: toRoleWithPermissionNames(user.role) },
    };
  }

  async refresh(user: User, token: string) {
    try {
      const sessionRaw = await this.redis.get(`session:${user.id}`);
      if (!sessionRaw) throw new UnauthorizedException("Session not found");

      const session: RedisSession = JSON.parse(sessionRaw);
      console.log(token, session);

      if (session.refresh_token !== token) {
        throw new UnauthorizedException("Refresh token invalid or reused");
      }

      // generate new tokens
      const payload = {
        id: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      };
      const access_token = this.jwtService.sign(payload, { expiresIn: "10h" });
      const refresh_token = this.jwtService.sign(
        { ...payload, isRefresh: true },
        { expiresIn: "7d" },
      );

      const redisValue = JSON.stringify({ access_token, refresh_token, user });
      const redisExp = 60 * 60 * 24 * 7; // 7 hari TTL

      // update redis
      await this.redis.set(`session:${user.id}`, redisValue, redisExp);

      return { access_token, refresh_token, user };
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.toLowerCase(), mode: "insensitive" } },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_token_expires_at: expiresAt,
      },
    });

    await this.emailService.sendResetPassword(user, token);

    return { message: "Reset password email sent" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_token: dto.token,
        reset_token_expires_at: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired token");
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(dto.password, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires_at: null,
      },
    });

    return { message: "Password reset successfully" };
  }
}
