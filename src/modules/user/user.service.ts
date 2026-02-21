import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";
import { paginate, parsePaginationQuery } from "src/common/helpers/paginate";

import { UpdateUserDto } from "./dto/update-user.dto";

import { toUserWithRoleAndPermissionNames } from "./user.mapper";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  findAll(query: BasePaginationQueryDto) {
    const options = parsePaginationQuery(query, {
      searchFields: ["name", "email"],
      allowedSortBy: ["name", "email", "created_at", "updated_at"],
    });

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

    return paginate(this.userRepo, args, options, toUserWithRoleAndPermissionNames);
  }

  async findOne(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return toUserWithRoleAndPermissionNames(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const updatedUser = await this.userRepo.update(id, dto, {
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

    return toUserWithRoleAndPermissionNames(updatedUser);
  }
}
