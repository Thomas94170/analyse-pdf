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

    console.log(incomeResult);
    return incomeResult;
  }

  async annualTaxation(year: number) {
    const incomeResult = await this.prisma.income.aggregate({
      where: { year, document: { status: 'VALIDATED', type: 'FACTURE' } },
      _sum: { amount: true },
    });
    const totalIncome = incomeResult._sum.amount || 0;
    const taxation = totalIncome * 0.261;
    console.log(`payer taxe : ${taxation}`);
    return taxation;
  }
}
