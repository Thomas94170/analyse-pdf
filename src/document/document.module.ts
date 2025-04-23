import { Module } from '@nestjs/common';
import { DocumentsService } from './document.service';
import { DocumentsController } from './document.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService],
  exports: [PrismaService],
})
export class DocumentModule {}
