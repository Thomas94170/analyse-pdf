// upload-document.dto.ts
import { IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  userId: string;
}
