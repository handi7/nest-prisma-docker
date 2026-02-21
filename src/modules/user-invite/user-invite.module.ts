import { Module } from "@nestjs/common";
import { EmailService } from "src/services/email/email.service";

import { RoleModule } from "../role/role.module";
import { UserModule } from "../user/user.module";

import { UserInviteController } from "./user-invite.controller";
import { UserInviteRepository } from "./user-invite.repository";
import { UserInviteService } from "./user-invite.service";

@Module({
  imports: [UserModule, RoleModule],
  controllers: [UserInviteController],
  providers: [UserInviteService, UserInviteRepository, EmailService],
  exports: [UserInviteService, UserInviteRepository],
})
export class UserInviteModule {}
