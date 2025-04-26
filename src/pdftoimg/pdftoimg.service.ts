import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PdfService {
  async convertPdfToImage(filename: string): Promise<string> {
    const input = join(__dirname, '..', '..', 'uploads', filename);

    const outputDir = join(__dirname, '..', '..', 'uploads', 'converted');
    mkdirSync(outputDir, { recursive: true });

    const outputBase = filename.replace('.pdf', '');

    //const command = `pdftocairo -png -f 1 -l 1 -scale-to 1024 "${input}" "${join(outputDir, outputBase)}"`;
    const pdftocairoPath = '/opt/homebrew/bin/pdftocairo'; // adapte à ton système
    const command = `${pdftocairoPath} -png -f 1 -l 1 -scale-to 1024 "${input}" "${join(outputDir, outputBase)}"`;

    const outputImage = join(outputDir, `${outputBase}-1.png`);

    try {
      console.log('📤 Conversion PDF → PNG...');
      await execAsync(command);
      console.log('✅ Image générée :', outputImage);
      return outputImage;
    } catch (error) {
      console.error('❌ Erreur pdftocairo :', error);
      throw new Error('Erreur lors de la conversion du PDF en image');
    }
  }
}
