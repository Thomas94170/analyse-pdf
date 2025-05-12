import { Module } from '@nestjs/common';

import { DocumentModule } from './document/document.module';
import { OcrService } from './ocr/ocr.service';
import { PdfService } from './pdftoimg/pdftoimg.service';
import { IncomeService } from './income/income.service';
import { IncomeModule } from './income/income.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceService } from './invoice/invoice.service';

@Module({
  imports: [DocumentModule, IncomeModule, InvoiceModule],
  controllers: [],
  providers: [OcrService, PdfService, IncomeService, InvoiceService],
})
export class AppModule {}
