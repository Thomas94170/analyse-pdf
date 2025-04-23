import { Injectable } from '@nestjs/common';
import { DocumentStatus, DocumentType, Document } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from '../ocr/ocr.service';
import { PdfService } from '../pdftoimg/pdftoimg.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly pdfService: PdfService,
  ) {}

  async create(file: Express.Multer.File): Promise<Document> {
    try {
      const convertPdf = await this.pdfService.convertPdfToImage(file.filename);
      console.log('conversion', convertPdf);
      const readTheText = await this.ocrService.extractTextFromPdf(convertPdf);
      console.log('texte', readTheText);
      const uploadDoc = await this.prisma.document.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          type: DocumentType.AUTRE,
          status: DocumentStatus.IN_PROGRESS,
          textExtracted: readTheText,
        },
      });
      console.log(uploadDoc, 'upload ici');
      return uploadDoc;
    } catch (error) {
      console.error('Erreur pendant l’enregistrement du document :', error);
      throw new Error('Erreur lors de la création du document');
    }
  }

  async readAllDocuments() {
    const allDocuments = await this.prisma.document.findMany({
      select: {
        id: true,
        originalName: true,
        textExtracted: true,
      },
    });
    return allDocuments;
  }

  async readDocumentById({ id }: { id: string }) {
    const docById = await this.prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        originalName: true,
        textExtracted: true,
      },
    });
    return docById;
  }
}
