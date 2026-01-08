import { Module } from "@nestjs/common";
import { UserInviteService } from "./user-invite.service";
import { UserInviteController } from "./user-invite.controller";
import { EmailService } from "src/services/email/email.service";
import { UserInviteRepository } from "./user-invite.repository";
import { UserModule } from "../user/user.module";
import { RoleModule } from "../role/role.module";

@Module({
  imports: [UserModule, RoleModule],
  controllers: [UserInviteController],
  providers: [UserInviteService, UserInviteRepository, EmailService],
  exports: [UserInviteService, UserInviteRepository],
})
export class UserInviteModule {}
