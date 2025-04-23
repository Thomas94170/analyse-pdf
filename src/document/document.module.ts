import { Module } from '@nestjs/common';
import { DocumentsService } from './document.service';
import { DocumentsController } from './document.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from '../ocr/ocr.service';
import { PdfService } from '../pdftoimg/pdftoimg.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, OcrService, PdfService],
  exports: [PrismaService],
})
export class DocumentModule {}
