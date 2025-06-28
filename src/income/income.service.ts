import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async annualIncome(year: number, userId: string) {
    // ✅ DOCS
    const docs = await this.prisma.income.findMany({
      where: {
        year,
        userId,
        documentId: { not: null },
      },
      include: {
        document: true,
      },
    });

    const docIncome = docs
      .filter(
        (d) =>
          d.document?.status === 'VALIDATED' && d.document?.type === 'FACTURE',
      )
      .reduce((sum, d) => sum + d.amount, 0);

    // ✅ INVOICES
    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        userId,
        dueDate: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      _sum: { totalInclTax: true },
    });

    console.log(`Invoices détectées pour ${year}:`, invoiceResult);

    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;

    console.log(`CA documents: ${docIncome}€`);
    console.log(`CA invoices: ${invoiceIncome}€`);
    console.log(`Total CA ${year}: ${totalIncome}€`);
    console.log(`Pour user: ${userId}`);

    return totalIncome;
  }

  async annualTaxation(year: number, userId: string) {
    // ✅ DOCS
    const docs = await this.prisma.income.findMany({
      where: {
        year,
        userId,
        documentId: { not: null },
      },
      include: {
        document: true,
      },
    });

    const docIncome = docs
      .filter(
        (d) =>
          d.document?.status === 'VALIDATED' && d.document?.type === 'FACTURE',
      )
      .reduce((sum, d) => sum + d.amount, 0);

    // ✅ INVOICES
    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        userId,
        dueDate: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      _sum: { totalInclTax: true },
    });

    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;
    const taxation = totalIncome * 0.261;

    console.log(`📊 Total CA ${year}: ${totalIncome}€`);
    console.log(`💸 Taxes dues ${year}: ${taxation}€`);

    return taxation;
  }

  async monthlyIncome(year: number, month: number, userId: string) {
    // ✅ DOCS
    const docs = await this.prisma.income.findMany({
      where: {
        year,
        month,
        userId,
        documentId: { not: null },
      },
      include: {
        document: true,
      },
    });

    const docIncome = docs
      .filter(
        (d) =>
          d.document?.status === 'VALIDATED' && d.document?.type === 'FACTURE',
      )
      .reduce((sum, d) => sum + d.amount, 0);

    // ✅ INVOICES
    const invoiceResult = await this.prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        userId,
        dueDate: {
          gte: new Date(
            `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`,
          ),
          lt: new Date(
            `${year}-${(month + 1).toString().padStart(2, '0')}-01T00:00:00Z`,
          ),
        },
      },
      _sum: { totalInclTax: true },
    });

    const invoiceIncome = invoiceResult._sum.totalInclTax || 0;
    const totalIncome = docIncome + invoiceIncome;

    console.log(
      `📅 CA du mois ${month}/${year}: ${totalIncome}€ pour userId: ${userId}`,
    );

    return totalIncome;
  }

  async monthlyTaxation(year: number, month: number, userId: string) {
    const totalIncomeByMonth = await this.monthlyIncome(year, month, userId);
    const taxation = totalIncomeByMonth * 0.261;

    console.log(
      `📅 taxation du mois ${month}/${year}: ${taxation}€ pour userId: ${userId}`,
    );

    return taxation;
  }
}
