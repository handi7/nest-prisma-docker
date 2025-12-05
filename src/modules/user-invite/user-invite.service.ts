import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { CreateUserInviteDto } from "./dto/create-user-invite.dto";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/common/dtos/env-config.dto";
import { paginate, PaginateOptions } from "src/common/helpers/paginate";
import { GetAllQueryDto } from "src/common/dtos/get-all-query.dto";
import { Prisma } from "generated/prisma/client";
import * as bcrypt from "bcryptjs";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { EmailService } from "src/services/email/email.service";

@Injectable()
export class UserInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async create(dto: CreateUserInviteDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await this.prisma.userInvite.upsert({
      where: { email },
      update: {
        token,
        expires_at: expiresAt,
        role_id: dto.role_id,
      },
      create: {
        email,
        role_id: dto.role_id,
        token,
        expires_at: expiresAt,
      },
      include: { role: true },
    });

    await this.emailService.sendUserInvite(email, token);

    return { message: "Invite sent successfully", data: invite };
  }

  async findAll(query: GetAllQueryDto) {
    const options: PaginateOptions = {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      search: query.search,
      searchFields: ["email"],
      sortBy: query.sortBy,
      desc: query.desc === "true",
      allowedSortBy: ["email", "created_at"],
    };

    const args: Prisma.UserInviteFindManyArgs = {
      include: { role: true },
    };

    const pagination = await paginate(this.prisma.userInvite, args, options);

    const roles = await this.prisma.role.findMany({
      where: { deleted_at: null },
    });

    return { ...pagination, meta: { roles } };
  }

  async findOne(token: string) {
    const invite = await this.prisma.userInvite.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invite) {
      throw new NotFoundException("Invite not found");
    }

    if (new Date() > invite.expires_at) {
      throw new BadRequestException("Invite expired");
    }

    return invite;
  }

  async accept(dto: AcceptInviteDto) {
    const invite = await this.findOne(dto.token);

    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(this.configService.get("BCRYPT_ROUNDS")) || 10,
    );

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: invite.email,
        password: hashedPassword,
        role_id: invite.role_id,
      },
    });

    await this.prisma.userInvite.delete({ where: { id: invite.id } });

    return user;
  }
}
