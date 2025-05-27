import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async annualIncome(year: number) {
    const docResult = await this.prisma.income.aggregate({
      where: {
        year,
        document: {
          status: 'VALIDATED',
          type: 'FACTURE',
        },
      },
      _sum: { amount: true },
    });

    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        dueDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _sum: { totalInclTax: true },
    });
    console.log(`Invoices détectées pour ${year}:`, invoiceResult);
    const docIncome = docResult._sum.amount || 0;
    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;

    console.log(`CA documents: ${docIncome}€`);
    console.log(`CA invoices: ${invoiceIncome}€`);
    console.log(`Total CA ${year}: ${totalIncome}€`);

    return totalIncome;
  }

  async annualTaxation(year: number) {
    const docResult = await this.prisma.income.aggregate({
      where: { year, document: { status: 'VALIDATED', type: 'FACTURE' } },
      _sum: { amount: true },
    });
    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        dueDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _sum: { totalInclTax: true },
    });

    const docIncome = docResult._sum.amount || 0;
    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;

    const taxation = totalIncome * 0.261;
    console.log(`📊 Total CA ${year}: ${totalIncome}€`);
    console.log(`💸 Taxes dues ${year}: ${taxation}€`);

    return taxation;
  }

  async monthlyIncome(year: number, month: number) {
    const docResult = await this.prisma.income.aggregate({
      where: {
        year,
        month,
        document: {
          status: 'VALIDATED',
          type: 'FACTURE',
        },
      },
      _sum: { amount: true },
    });

    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        dueDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: { totalInclTax: true },
    });

    const docIncome = docResult._sum.amount || 0;
    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;

    console.log(`📅 CA du mois ${month}/${year}: ${totalIncome}€`);

    return totalIncome;
  }

  async monthlyTaxation(year: number, month: number) {
    const totalIncomeByMonth = await this.monthlyIncome(year, month);

    const taxation = totalIncomeByMonth * 0.261;
    console.log(`📅 taxation du mois ${month}/${year}: ${taxation}€`);
    return taxation;
  }
}
