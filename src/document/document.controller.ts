import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './document.service';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier reçu');
      }
      return await this.documentsService.create(file);
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
        throw new NotFoundException(`Aucun doc en bdd`);
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
        throw new NotFoundException(`Pas de doc avec id ${id}`);
      }
      return docById;
    } catch (error) {
      console.log(error);
    }
  }
}
