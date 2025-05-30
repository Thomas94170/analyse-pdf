import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async readAllInvoices() {
    const allInvoices = await this.prisma.invoice.findMany({
      select: {
        id: true,
        client: true,
        totalBT: true,
        totalInclTax: true,
        dueDate: true,
        phoneNumber: true,
        email: true,
        userId: true,
        user: { select: { email: true } },
      },
    });
    return allInvoices;
  }

  async invoiceByClient({ client }: { client: string }) {
    const byClient = await this.prisma.invoice.findMany({
      where: { client },
      select: {
        client: true,
        id: true,
        totalBT: true,
        totalInclTax: true,
        phoneNumber: true,
        dueDate: true,
        email: true,
        userId: true,
        user: { select: { email: true } },
      },
    });
    return byClient;
  }

  async invoiceById({ id }: { id: string }) {
    const byId = await this.prisma.invoice.findUnique({
      where: { id },
      select: {
        client: true,
        id: true,
        totalBT: true,
        totalInclTax: true,
        phoneNumber: true,
        dueDate: true,
        email: true,
        userId: true,
        user: { select: { email: true } },
      },
    });
    return byId;
  }

  async invoiceByDueDate({ dueDate }: { dueDate: Date }) {
    const startOfDay = new Date(dueDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dueDate.setHours(23, 59, 59, 999));
    const byDate = await this.prisma.invoice.findMany({
      where: { dueDate: { gte: startOfDay, lte: endOfDay } },
      select: {
        id: true,
        client: true,
        totalBT: true,
        totalInclTax: true,
        phoneNumber: true,
        dueDate: true,
        email: true,
      },
    });
    return byDate;
  }

  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { invoiceName: createInvoiceDto.invoiceName },
    });
    if (existingInvoice) {
      throw new BadRequestException(
        `invoice already exists with number ${createInvoiceDto.invoiceName}`,
      );
    }
    const create = await this.prisma.invoice.create({
      data: {
        invoiceName: createInvoiceDto.invoiceName,
        client: createInvoiceDto.client,
        totalBT: createInvoiceDto.totalBT,
        totalInclTax: createInvoiceDto.totalInclTax,
        dueDate: createInvoiceDto.dueDate,
        phoneNumber: createInvoiceDto.phoneNumber,
        email: createInvoiceDto.email,
        userId: createInvoiceDto.userId,
      },
    });
    console.log(`invoice created`);
    return create;
  }

  async updateInvoice({ invoiceName }: { invoiceName: string }) {
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { invoiceName },
    });
    if (!existingInvoice) {
      throw new BadRequestException(`no updated invoice`);
    }
    const updatedInvoice = await this.prisma.invoice.update({
      where: { invoiceName },
      data: { status: 'PAID' },
    });

    const existingIncome = await this.prisma.income.findFirst({
      where: { invoiceId: updatedInvoice.id },
    });
    if (!existingIncome) {
      const dueDate = updatedInvoice.dueDate;
      const year = dueDate.getFullYear();
      const month = dueDate.getMonth() + 1;
      await this.prisma.income.create({
        data: {
          amount: updatedInvoice.totalInclTax,
          year: year,
          month,
          invoiceId: updatedInvoice.id,
          userId: updatedInvoice.userId,
        },
      });
      console.log(
        `💰 Income recorded for Invoice ${invoiceName} : ${updatedInvoice.totalInclTax}€ for month ${month} for year ${year}`,
      );
    } else {
      console.log(`ℹIncome already exists ${invoiceName}`);
    }
    return updatedInvoice;
  }
}
