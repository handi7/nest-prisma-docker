import { Controller, Get, Param, Patch } from "@nestjs/common";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ZodBody } from "src/common/decorators/zod-body.decorator";
import { ZodQuery } from "src/common/decorators/zod-query.decorator";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";

import { UpdateUserDto, UpdateUserSchema } from "./user.schema";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("users")
  @Permissions("user.view")
  findAll(@ZodQuery() query: BasePaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get("user/:id")
  @Permissions("user.view")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch("user/:id")
  @Permissions("user.edit")
  update(@Param("id") id: string, @ZodBody(UpdateUserSchema) dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
