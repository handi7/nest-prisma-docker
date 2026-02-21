import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { Prisma } from "generated/prisma/client";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";
import { EnvConfig } from "src/common/dtos/env-config.dto";
import { paginate, parsePaginationQuery } from "src/common/helpers/paginate";
import { EmailService } from "src/services/email/email.service";
import { v4 as uuidv4 } from "uuid";

import { RoleRepository } from "../role/role.repository";
import { UserRepository } from "../user/user.repository";

import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { CreateUserInviteDto } from "./dto/create-user-invite.dto";

import { UserInviteRepository } from "./user-invite.repository";

@Injectable()
export class UserInviteService {
  constructor(
    private readonly userInviteRepo: UserInviteRepository,
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async create(dto: CreateUserInviteDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.userInviteRepo.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await this.userInviteRepo.upsertByEmail(email, {
      create: {
        email,
        role_id: dto.role_id,
        token,
        expires_at: expiresAt,
      },
      update: {
        token,
        expires_at: expiresAt,
        role_id: dto.role_id,
      },
      include: { role: true },
    });

    await this.emailService.sendUserInvite(email, token);

    return { message: "Invite sent successfully", data: invite };
  }

  async findAll(query: BasePaginationQueryDto) {
    const queryOptions = parsePaginationQuery(query, {
      searchFields: ["email"],
      allowedSortBy: ["email", "created_at"],
    });

    const args: Prisma.UserInviteFindManyArgs = {
      include: { role: true },
    };

    const { data, meta: pagination } = await paginate(this.userInviteRepo, args, queryOptions);

    const roles = await this.roleRepo.findMany({
      where: { deleted_at: null },
    });

    return { data, meta: { pagination, roles } };
  }

  async findOneByToken(token: string) {
    const invite = await this.userInviteRepo.findByToken(token);

    if (!invite) {
      throw new NotFoundException("Invite not found");
    }

    if (new Date() > invite.expires_at) {
      throw new BadRequestException("Invite expired");
    }

    return invite;
  }

  async accept(dto: AcceptInviteDto) {
    const invite = await this.userInviteRepo.findByToken(dto.token);

    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(this.configService.get("BCRYPT_ROUNDS")) || 10,
    );

    const user = await this.userRepo.create({
      name: dto.name,
      email: invite.email,
      password: hashedPassword,
      role: { connect: { id: invite.role_id } },
    });

    await this.userInviteRepo.delete(invite.id);

    return user;
  }
}
