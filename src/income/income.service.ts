import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async annualIncome(year: number) {
    const incomeResult = await this.prisma.income.aggregate({
      where: { year },
      _sum: { amount: true },
    });
    return incomeResult;
  }
}
