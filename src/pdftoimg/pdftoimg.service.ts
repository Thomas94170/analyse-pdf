import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PdfService {
  async convertPdfToImage(filename: string): Promise<string> {
    // Chemin vers le PDF source
    const input = join(__dirname, '..', '..', 'uploads', filename);

    // Dossier de sortie des PNG
    const outputDir = join(__dirname, '..', '..', 'uploads', 'converted');
    mkdirSync(outputDir, { recursive: true });

    // Nom de base sans extension
    const outputBase = filename.replace('.pdf', '');

    // Commande shell pour pdftocairo
    const command = `pdftocairo -png -f 1 -l 1 -scale-to 1024 "${input}" "${join(outputDir, outputBase)}"`;

    // Chemin final de l’image attendue (page 1)
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
