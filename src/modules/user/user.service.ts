import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetAllQueryDto } from "src/common/dtos/get-all-query.dto";
import { paginate, PaginateOptions } from "src/common/helpers/paginate";
import { Prisma } from "generated/prisma/client";
import { PrismaService } from "src/services/prisma/prisma.service";
import { toUserWithRoleAndPermissionNames } from "./user.mapper";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: GetAllQueryDto) {
    const options: PaginateOptions = {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      search: query.search,
      searchFields: ["name", "email"],
      sortBy: query.sortBy,
      desc: query.desc === "true",
      allowedSortBy: ["name", "email", "created_at", "updated_at"],
    };

    const args: Prisma.UserFindManyArgs = {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    };

    return paginate(this.prisma.user, args, options, toUserWithRoleAndPermissionNames);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return toUserWithRoleAndPermissionNames(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });

    return toUserWithRoleAndPermissionNames(user);
  }
}
