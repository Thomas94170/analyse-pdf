import { Module } from '@nestjs/common';

import { DocumentModule } from './document/document.module';
import { OcrService } from './ocr/ocr.service';
import { PdfService } from './pdftoimg/pdftoimg.service';
import { IncomeService } from './income/income.service';
import { IncomeModule } from './income/income.module';

@Module({
  imports: [DocumentModule, IncomeModule],
  controllers: [],
  providers: [OcrService, PdfService, IncomeService],
})
export class AppModule {}
