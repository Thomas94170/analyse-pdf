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
      console.log(
        `Texte OCR (${readTheText.length} caractères) :`,
        readTheText,
      );

      const type = this.whatTypeOfDoc(readTheText);
      console.log(type, 'type');
      const uploadDoc = await this.prisma.document.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          type: type,
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

  async deleteDocument({ id }: { id: string }) {
    try {
      const delDoc = await this.prisma.document.delete({ where: { id } });
      return delDoc;
    } catch (error) {
      throw new Error(`erreur: ${error}`);
    }
  }

  async getDocumentByWordKey(query: string) {
    try {
      const searchWord = await this.prisma.document.findMany({
        where: {
          textExtracted: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          originalName: true,
          type: true,
          textExtracted: true,
        },
      });
      return searchWord;
    } catch (error) {
      throw new Error(`Èrreur dans la recherche par mot clé: ${error}`);
    }
  }

  private whatTypeOfDoc(text: string): DocumentType {
    const lower = text.toLowerCase();
    console.log('Analyse :', lower);

    if (
      lower.includes('cerfa') ||
      lower.includes('formulaire cerfa') ||
      lower.match(/cerfa\s*n?[°0-9]/)
    ) {
      return DocumentType.CERFA;
    }

    if (
      lower.includes('facture') ||
      lower.includes('tva') ||
      lower.includes('client') ||
      lower.includes('total ht') ||
      lower.includes('siret')
    ) {
      return DocumentType.FACTURE;
    }

    return DocumentType.AUTRE;
  }
}
