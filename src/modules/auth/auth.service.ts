import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { compareSync, genSalt, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

      const access_token = this.jwtService.sign(jwtPayload, {
        expiresIn: "10h",
      });

      const refresh_token = this.jwtService.sign(
        { ...jwtPayload, isRefresh: true },
        { expiresIn: "7d" },
      );

      return { access_token, refresh_token, user: userData };
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
