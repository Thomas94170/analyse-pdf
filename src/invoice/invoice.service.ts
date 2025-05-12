import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      },
    });
    return allInvoices;
  }
}
