import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { ZodSchema } from "src/common/decorators/zod-schema.decorator";
import { BasePaginationQueryDto } from "src/common/dtos/base-pagination-query.dto";

import {
  AcceptInviteDto,
  AcceptInviteSchema,
  CreateUserInviteDto,
  CreateUserInviteSchema,
} from "./user-invite.schema";
import { UserInviteService } from "./user-invite.service";

@Controller()
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) {}

  @Post("user-invite")
  @Permissions("user_invite.create")
  @ZodSchema(CreateUserInviteSchema)
  create(@Body() dto: CreateUserInviteDto) {
    return this.userInviteService.create(dto);
  }

  @Get("user-invites")
  @Permissions("user_invite.view")
  findAll(@Query() query: BasePaginationQueryDto) {
    return this.userInviteService.findAll(query);
  }

  @Get("user-invite/:token")
  @Public()
  findOne(@Param("token") token: string) {
    return this.userInviteService.findOneByToken(token);
  }

  @Post("user-invite/accept")
  @Public()
  @ZodSchema(AcceptInviteSchema)
  accept(@Body() dto: AcceptInviteDto) {
    return this.userInviteService.accept(dto);
  }
}
