import { Controller, Get, Body, Patch, Param, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("users")
  @Permissions("view_user")
  findAll(@Query() query: BasePaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get("user/:id")
  @Permissions("view_user")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch("user/:id")
  @Permissions("edit_user")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
