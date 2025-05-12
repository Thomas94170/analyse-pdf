import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, InvoiceService],
  controllers: [InvoiceController],
  exports: [PrismaService],
})
export class InvoiceModule {}
