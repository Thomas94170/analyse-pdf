import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(file: Express.Multer.File, userId: string): Promise<Document> {
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
          userId: userId,
        },
      });
      console.log(uploadDoc, 'upload ici');

      await this.recordInvoice(uploadDoc.id, dataExtracted);
      return uploadDoc;
    } catch (error) {
      console.error('Erreur pendant l’enregistrement du document :', error);
      throw new Error('Erreur lors de la création du document');
    }
  }

  async updateDocs({ originalName }: { originalName: string }) {
    const findDoc = await this.prisma.document.findUnique({
      where: { originalName },
    });

    if (!findDoc) {
      throw new BadRequestException(
        `aucun document à ce jour à mettre à jour: ${findDoc}`,
      );
    }

    const docUpdated = await this.prisma.document.update({
      where: { originalName },
      data: { status: 'VALIDATED' },
    });

    await this.recordInvoice(
      docUpdated.id,
      docUpdated.metadata as Record<string, string | null> | null,
    );
    return docUpdated;
  }

  async readAllDocuments() {
    const allDocuments = await this.prisma.document.findMany({
      select: {
        id: true,
        originalName: true,
        textExtracted: true,
        metadata: true,
        userId: true,
        user: { select: { email: true } },
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
        userId: true,
        user: { select: { email: true } },
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
          userId: true,
          user: { select: { email: true } },
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
      lower.includes('payée')
      //||
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
      const factureMatch = text.match(/n[°º]?\s*(fa-\d{6}-\d+)/i);
      const paidMatch = text.match(/payée\s*[:-]?\s*((?:\d\s*){14})/i);
      const totalHTMatch = text.match(/total\s*ht\s*[:=-]?\s*([\d\s,.]+)/i);
      const totalTTCMatch = text.match(/total\s*ttc\s*[:=-]?\s*([\d\s,.]+)/i);
      const paymentDateMatch = text.match(
        /(?:date\s+d[’']échéance|date)\s*[:=-]?\s*(\d{1,2}(?:\/|-|\s)?(?:\d{1,2}|[a-zéû]+)(?:\/|-|\s)?\d{2,4})/i,
      );

      result.facture = factureMatch ? factureMatch[1].replace(/\s/g, '') : null;
      result.paid = paidMatch ? paidMatch[1].replace(/\s/g, '') : null;
      result.totalHT = totalHTMatch?.[1].replace(/\s/g, '') || null;
      result.totalTTC = totalTTCMatch?.[1].replace(/\s/g, '') || null;
      result.paymentDate = paymentDateMatch?.[1].replace(/\s/g, '') || null;
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

  private extractMonthFromRawDate(rawdate: string): Date | null {
    const normalized = rawdate.replace(',', '.');

    const slashDate = normalized.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (slashDate) {
      const [day, month, year] = slashDate;
      const y = year.length === 2 ? `20${year}` : year;
      return new Date(`${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }

    const spacedDate = normalized.match(/(\d{1,2})\s+(.*?)\s+(\d{4})/i);
    if (spacedDate) {
      const day = spacedDate[1];
      const monthName = spacedDate[2].toLowerCase();
      const year = spacedDate[3];
      const monthMap = {
        janvier: 1,
        février: 2,
        mars: 3,
        avril: 4,
        mai: 5,
        juin: 6,
        juillet: 7,
        août: 8,
        septembre: 9,
        octobre: 10,
        novembre: 11,
        décembre: 12,
      };
      const month = monthMap[monthName];
      if (month)
        return new Date(
          `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`,
        );
    }

    const compactDate = normalized.match(/(\d{1,2})([a-zéû]+)(\d{4})/i);
    if (compactDate) {
      const day = compactDate[1];
      const monthName = compactDate[2].toLowerCase();
      const year = compactDate[3];
      const monthMap = {
        janvier: 1,
        février: 2,
        mars: 3,
        avril: 4,
        mai: 5,
        juin: 6,
        juillet: 7,
        août: 8,
        septembre: 9,
        octobre: 10,
        novembre: 11,
        décembre: 12,
      };
      const month = monthMap[monthName];
      if (month)
        return new Date(
          `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`,
        );
    }
    return null;
  }

  private async recordInvoice(
    documentId: string,
    metadata: Record<string, string | null> | null,
  ): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userId: true,
        status: true,
        type: true,
      },
    });
    if (
      !document ||
      document.status !== 'VALIDATED' ||
      document.type !== 'FACTURE'
    ) {
      console.log('Document exclu du traitement income :', {
        exists: !!document,
        status: document?.status,
        type: document?.type,
      });
      return;
    }
    const userId = document.userId;

    const totalTTCString = metadata?.totalTTC?.replace(',', '.');
    const amount = totalTTCString ? parseFloat(totalTTCString) : null;
    console.log(totalTTCString, amount);

    const rawDate = metadata?.paymentDate;
    let year: number | null = null;
    console.log(year);

    if (rawDate) {
      //format normal
      const dateParts = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (dateParts) {
        const [, , , yearPart] = dateParts;
        year = parseInt(yearPart.length === 2 ? `20${yearPart}` : yearPart);
      }

      if (!year) {
        const spacedDate = rawDate.match(
          /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i,
        );
        if (spacedDate) {
          year = parseInt(spacedDate[3]);
        }
      }

      if (!year) {
        //format collé

        const compactedDate = rawDate.match(
          /(\d{1,2})(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(\d{4})/i,
        );
        if (compactedDate) {
          year = parseInt(compactedDate[3]);
        }
      }
    }

    if (amount && year) {
      let month: number | null = null;

      if (rawDate) {
        const findMonth = this.extractMonthFromRawDate(rawDate);
        if (findMonth) {
          month = findMonth.getMonth() + 1;
        }
      }

      if (!month) {
        console.log('month not find no recording for this invoice');
      }
      await this.prisma.income.create({
        data: {
          amount,
          year,
          month,
          documentId,
          userId
        },
      });
      console.log(`💸 Income enregistré : ${amount}€ pour ${month} - ${year}`);
    } else {
      console.log('⚠️ Income non enregistré : données manquantes');
    }
  }
}
