import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async readAllInvoices() {
    try {
      const allInvoices = await this.invoiceService.readAllInvoices();
      if (allInvoices.length === 0) {
        throw new NotFoundException(`no invoices in db`);
      }
      return allInvoices;
    } catch (error) {
      throw new BadRequestException(`error in db ${error}`);
    }
  }

  @Get('id/:id')
  async invoiceById(@Param('id') id: string) {
    try {
      const byId = await this.invoiceService.invoiceById({ id });
      if (!byId) {
        throw new NotFoundException(`no invoice with this id ${id}`);
      }
      return byId;
    } catch (error) {
      throw new BadRequestException(`error in search by id ${error}`);
    }
  }

  @Get(':userId')
  async readInvoicesByUser(@Param('userId') userId: string) {
    try {
      const invoices = await this.invoiceService.findByUserId(userId);
      return invoices;
    } catch (error) {
      throw new BadRequestException(`error while fetching invoices: ${error}`);
    }
  }

  @Get('client/:client')
  async invoiceByClient(@Param('client') client: string) {
    try {
      const byClient = await this.invoiceService.invoiceByClient({ client });
      if (byClient.length === 0) {
        throw new NotFoundException(`no client with this name in db`);
      }
      return byClient;
    } catch (error) {
      throw new BadRequestException(`error in search by client ${error}`);
    }
  }

  @Get('due-date')
  async invoiceByDueDate(@Query('dueDate') dueDate: string) {
    try {
      const parsedDate = new Date(dueDate);

      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException(`Invalid date format: ${dueDate}`);
      }
      const byDueDate = await this.invoiceService.invoiceByDueDate({
        dueDate: parsedDate,
      });
      if (byDueDate.length === 0) {
        throw new NotFoundException(`no client with this name in db`);
      }
      return byDueDate;
    } catch (error) {
      throw new BadRequestException(`error in search by due date ${error}`);
    }
  }

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    try {
      const create = await this.invoiceService.createInvoice(createInvoiceDto);
      return create;
    } catch (error) {
      throw new BadRequestException(`error in creation ${error}`);
    }
  }

  @Patch('update/:invoiceName')
  async updateInvoice(@Param('invoiceName') invoiceName: string) {
    try {
      const changeStatus = await this.invoiceService.updateInvoice({
        invoiceName,
      });
      if (!changeStatus) {
        throw new BadRequestException(`no update for this invoice`);
      }
      return changeStatus;
    } catch (error) {
      throw new BadRequestException(`error in update ${error}`);
    }
  }
}
