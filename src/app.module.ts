import { Module } from '@nestjs/common';

import { DocumentModule } from './document/document.module';
import { OcrService } from './ocr/ocr.service';
import { PdfService } from './pdftoimg/pdftoimg.service';

@Module({
  imports: [DocumentModule],
  controllers: [],
  providers: [OcrService, PdfService],
})
export class AppModule {}
