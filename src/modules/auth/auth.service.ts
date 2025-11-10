import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { compareSync, genSalt, hash } from "bcryptjs";
import { PrismaService } from "../../services/prisma/prisma.service";
import { RedisService } from "../../services/redis/redis.service";
import { UserDto } from "src/common/dtos/user.dto";
import { RedisSession } from "src/common/dtos/redis-session.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: { equals: dto.email.toLowerCase(), mode: "insensitive" } },
      });

      if (existingUser) {
        throw new ConflictException("Account already registered");
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(dto.password, salt);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          roleId: dto.role_id,
        },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });

      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: { equals: dto.email.toLowerCase(), mode: "insensitive" } },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });

      if (!user) {
        throw new NotFoundException("Akun tidak ditemukan");
      }

      if (!compareSync(dto.password, user.password)) {
        throw new BadRequestException("Password salah");
      }

      const { password: _, ...userData } = user;

      const jwtPayload = {
        id: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      };

      const access_token = this.jwtService.sign(jwtPayload, { expiresIn: "10h" });

      const refresh_token = this.jwtService.sign(
        { ...jwtPayload, isRefresh: true },
        { expiresIn: "7d" },
      );

      const redisValue = JSON.stringify({ access_token, refresh_token });
      const redisExp = 60 * 60 * 24 * 7; // 7 hari TTL
      await this.redis.set(`session:${user.id}`, redisValue, redisExp);

      return { access_token, refresh_token, user: userData };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async refresh(user: UserDto, token: string) {
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

      const redisValue = JSON.stringify({ access_token, refresh_token });
      const redisExp = 60 * 60 * 24 * 7; // 7 hari TTL

      // update redis
      await this.redis.set(`session:${user.id}`, redisValue, redisExp);

      return { access_token, refresh_token, user };
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
