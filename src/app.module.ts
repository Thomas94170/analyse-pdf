import { Module } from '@nestjs/common';

import { DocumentModule } from './document/document.module';
import { OcrService } from './ocr/ocr.service';
import { PdfService } from './pdftoimg/pdftoimg.service';
import { IncomeService } from './income/income.service';
import { IncomeModule } from './income/income.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceService } from './invoice/invoice.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { MailerService } from './mailer/mailer.service';

@Module({
  imports: [
    DocumentModule,
    IncomeModule,
    InvoiceModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule,
  ],
  controllers: [],
  providers: [
    OcrService,
    PdfService,
    IncomeService,
    InvoiceService,
    MailerService,
  ],
})
export class AppModule {}
