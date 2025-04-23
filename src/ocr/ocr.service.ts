import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
//import { join } from 'path';

@Injectable()
export class OcrService {
  async extractTextFromPdf(filePath: string): Promise<string> {
    // const filePath = join(__dirname, '..', '..', 'uploads', filename);
    console.log(filePath);

    const result = await Tesseract.recognize(filePath, 'fra', {
      logger: (m) => console.log(m),
    });
    console.log(result);

    return result.data.text;
  }
}
