import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { Prisma, UserInvite } from "generated/prisma/client";

@Injectable()
export class UserInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserInviteCreateInput): Promise<UserInvite> {
    return this.prisma.userInvite.create({ data });
  }

  update(
    id: string,
    data: Prisma.UserInviteUpdateInput,
    options?: Omit<Prisma.UserInviteUpdateArgs, "where" | "data">,
  ): Promise<UserInvite> {
    return this.prisma.userInvite.update({
      where: { id },
      data,
      ...options,
    });
  }

  upsertByEmail<T extends Prisma.UserInviteUpsertArgs>(email: string, args: Omit<T, "where">) {
    return this.prisma.userInvite.upsert({
      ...args,
      where: { email: email.toLowerCase() },
    });
  }

  findById(id: string): Promise<UserInvite | null> {
    return this.prisma.userInvite.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<UserInvite | null> {
    return this.prisma.userInvite.findUnique({
      where: { email },
    });
  }

  findByToken(token: string): Promise<UserInvite | null> {
    return this.prisma.userInvite.findUnique({
      where: { token },
    });
  }

  findMany(args: Prisma.UserInviteFindManyArgs): Promise<UserInvite[]> {
    return this.prisma.userInvite.findMany(args);
  }

  count(where: Prisma.UserInviteWhereInput): Promise<number> {
    return this.prisma.userInvite.count({ where });
  }

  delete(id: string): Promise<UserInvite> {
    return this.prisma.userInvite.delete({ where: { id } });
  }
}
