import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
//import { MailerController } from './mailer.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [MailerService, PrismaService],
  exports: [MailerService],
  // controllers: [MailerController],
})
export class MailerModule {}
