import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { UserInviteService } from "./user-invite.service";
import { CreateUserInviteDto } from "./dto/create-user-invite.dto";
import { GetAllQueryDto } from "src/common/dtos/get-all-query.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { Public } from "src/common/decorators/public.decorator";
import { Permissions } from "src/common/decorators/permissions.decorator";

@Controller()
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) {}

  @Post("user-invite")
  @Permissions("create_user_invite")
  create(@Body() dto: CreateUserInviteDto) {
    return this.userInviteService.create(dto);
  }

  @Get("user-invites")
  @Permissions("view_user_invite")
  findAll(@Query() query: GetAllQueryDto) {
    return this.userInviteService.findAll(query);
  }

  @Get("user-invite/:token")
  @Public()
  findOne(@Param("token") token: string) {
    return this.userInviteService.findOne(token);
  }

  @Post("user-invite/accept")
  @Public()
  accept(@Body() dto: AcceptInviteDto) {
    return this.userInviteService.accept(dto);
  }
}
