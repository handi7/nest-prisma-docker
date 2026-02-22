import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ZodSchema } from "src/common/decorators/zod-schema.decorator";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";

import { UpdateUserDto, UpdateUserSchema } from "./user.schema";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("users")
  @Permissions("user.view")
  findAll(@Query() query: BasePaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get("user/:id")
  @Permissions("user.view")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch("user/:id")
  @Permissions("user.edit")
  @ZodSchema(UpdateUserSchema)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
