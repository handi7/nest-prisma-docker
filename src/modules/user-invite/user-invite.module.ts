import { Module } from '@nestjs/common';
import { UserInviteService } from './user-invite.service';
import { UserInviteController } from './user-invite.controller';
import { EmailService } from 'src/services/email/email.service';

@Module({
  controllers: [UserInviteController],
  providers: [UserInviteService, EmailService],
})
export class UserInviteModule {}
