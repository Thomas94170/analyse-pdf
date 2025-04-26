import { Injectable } from '@nestjs/common';
import { DocumentStatus, DocumentType, Document, Prisma } from '@prisma/client';
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
      const normalizedText = readTheText
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const existingDocument = await this.prisma.document.findFirst({
        where: { textExtracted: normalizedText },
      });
      if (existingDocument) {
        throw new Error(`Document doublon, pas dupload `);
      }

      const type = this.whatTypeOfDoc(normalizedText);
      const dataExtracted: Record<string, string | null> | null =
        this.extractMetaData(type, normalizedText);

      console.log(type, 'type');
      const uploadDoc = await this.prisma.document.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          type: type,
          status: DocumentStatus.IN_PROGRESS,
          textExtracted: normalizedText,
          metadata: dataExtracted ?? Prisma.DbNull,
        },
      });
      console.log(uploadDoc, 'upload ici');
      // Création de l'entrée Income si données disponibles
      const totalTTCString = dataExtracted?.totalTTC?.replace(',', '.');
      const amount = totalTTCString ? parseFloat(totalTTCString) : null;

      const rawDate = dataExtracted?.paymentDate;
      let year: number | null = null;

      if (rawDate) {
        const dateParts = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        if (dateParts) {
          const [, , , yearPart] = dateParts;
          year = parseInt(yearPart.length === 2 ? `20${yearPart}` : yearPart);
        }
      }

      if (amount && year) {
        await this.prisma.income.create({
          data: {
            amount,
            year,
            documentId: uploadDoc.id,
          },
        });
        console.log(`💸 Income enregistré : ${amount}€ pour ${year}`);
      } else {
        console.log('⚠️ Income non enregistré : données manquantes');
      }

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
        metadata: true,
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
        metadata: true,
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
      lower.includes('facture')
      //||
      // lower.includes('tva') ||
      // lower.includes('client') ||
      // lower.includes('total ht') ||
      // lower.includes('siret')
    ) {
      return DocumentType.FACTURE;
    }

    if (lower.includes('devis') || lower.includes('bon pour accord')) {
      return DocumentType.DEVIS;
    }

    return DocumentType.AUTRE;
  }

  private extractMetaData(
    type: DocumentType,
    text: string,
  ): Record<string, string | null> | null {
    const result: Record<string, string | null> = {};

    if (type === DocumentType.FACTURE) {
      const factureMatch = text.match(/facture\s*ht\s*[:=-]?\s*([\d\s,.]+)/i);
      //const siretMatch = text.match(/siret\s*[:-]?\s*((?:\d\s*){14})/i);
      //const totalHTMatch = text.match(/total\s*ht\s*[:=-]?\s*([\d\s,.]+)/i);
      //const totalTTCMatch = text.match(/total\s*ttc\s*[:=-]?\s*([\d\s,.]+)/i);
      // const paymentDateMatch = text.match(
      //(?:échéance(?:\s+de\s+paiement)?|date(?:\s+d['e]mission|\s+d['e]chéance|\s+de\s+paiement)?|date)?\s*[:=-]?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      // );

      result.facture = factureMatch ? factureMatch[1].replace(/\s/g, '') : null;
      // result.siret = siretMatch ? siretMatch[1].replace(/\s/g, '') : null;
      // result.totalHT = totalHTMatch?.[1].replace(/\s/g, '') || null;
      // result.totalTTC = totalTTCMatch?.[1].replace(/\s/g, '') || null;
      // result.paymentDate = paymentDateMatch?.[1].replace(/\s/g, '') || null;
    }

    if (type === DocumentType.CERFA) {
      const cerfaNumber = text.match(/cerfa\s*(n[°o]?)?\s*(\d{5})/i);
      result.formulaire = cerfaNumber?.[2] || null;
    }

    if (type === DocumentType.DEVIS) {
      const devisMatch = text.match(/devis\s*(n[°o]?)?\s*(\d{5})/i);
      //  const mentionMatch = text.match(/bon pour accord\s*(n[°o]?)?\s*(\d{5})/i);
      result.devis = devisMatch ? devisMatch[3].replace(/\s/g, '') : null;
      // result.mention = mentionMatch ? mentionMatch[3].replace(/\s/g, '') : null;
    }

    return result;
  }
}
