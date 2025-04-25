import { Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeService } from './income.service';

@Module({
  controllers: [IncomeController],
  providers: [PrismaService, IncomeService],
  exports: [PrismaService],
})
export class IncomeModule {}
