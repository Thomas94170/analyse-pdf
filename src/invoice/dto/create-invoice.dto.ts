import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @IsString()
  invoiceName: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  totalBT: number;

  @IsNumber()
  totalInclTax: number;

  @IsString()
  client: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
