import { Injectable } from '@nestjs/common';
import { DocumentStatus, DocumentType, Document } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: Express.Multer.File): Promise<Document> {
    try {
      const uploadDoc = await this.prisma.document.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${file.filename}`,
          type: DocumentType.AUTRE,
          status: DocumentStatus.IN_PROGRESS,
        },
      });

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
      },
    });
    return docById;
  }
}
