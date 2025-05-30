import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Delete,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './document.service';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = uuidv4() + extname(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.pdf$/i)) {
          return cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    const { userId } = uploadDocumentDto;
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier reçu');
      }
      if (!userId) {
        throw new BadRequestException('userId requis');
      }
      return await this.documentsService.create(file, userId);
    } catch (error) {
      console.error('Erreur dans uploadFile :', error);
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.message || "Échec de l'upload du document",
      );
    }
  }

  @Get()
  async readAllDocuments() {
    try {
      const readAll = await this.documentsService.readAllDocuments();
      if (!readAll) {
        throw new BadRequestException(`Aucun doc en bdd`);
      }
      return readAll;
    } catch (error) {
      console.error(error);
    }
  }

  @Get('id/:id')
  async readOneDoc(@Param('id') id: string) {
    try {
      const docById = await this.documentsService.readDocumentById({ id });
      if (!docById) {
        throw new BadRequestException(`Pas de doc avec id ${id}`);
      }
      return docById;
    } catch (error) {
      console.log(error);
    }
  }

  @Get('searchByWord')
  async searchByWord(@Query('query') query: string) {
    const search = await this.documentsService.getDocumentByWordKey(query);
    if (!query || query.trim().length === 0) {
      throw new BadRequestException(`Aucune lettre ou mot renseigné`);
    }
    return search;
  }

  @Delete('delete/:id')
  async deleteDocument(@Param('id') id: string) {
    try {
      const delDocument = await this.documentsService.deleteDocument({ id });
      if (!delDocument) {
        throw new BadRequestException(`pas de doc à effacer avec id: ${id}`);
      }
      return delDocument;
    } catch (error) {
      console.log(error);
    }
  }

  @Patch('update/:facture')
  async updateDocument(@Param('facture') originalName: string) {
    try {
      const changeStatus = await this.documentsService.updateDocs({
        originalName,
      });
      if (!changeStatus) {
        throw new BadRequestException(
          `pas de doc à mettre à jour avec id: ${originalName}`,
        );
      }
      return {
        document: changeStatus,
        message: `document mis à jour, facture enregistrée payée`,
      };
    } catch (error) {
      console.error(
        `erreur lors du changement de statut de la facture:  ${error}`,
      );
    }
  }
}
