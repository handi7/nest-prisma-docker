import { Injectable } from "@nestjs/common";
import { Prisma, User } from "generated/prisma/client";
import { BaseRepository } from "src/common/base/base.repository";
import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class UserRepository extends BaseRepository<
  PrismaService["user"],
  User,
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserOrderByWithRelationInput,
  Prisma.UserInclude,
  Prisma.UserSelect,
  Prisma.UserOmit
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }
}
