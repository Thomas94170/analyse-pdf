<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->



📦 Smart Invoice – Technical Documentation

🌐 Project Architecture

Smart Invoice is built as a monolithic application using NestJS.
It provides a complete backend solution for managing invoices, documents, and income calculations for freelancers (auto-entrepreneurs).

🏗️ Key Technologies:
Backend: NestJS + Prisma ORM (PostgreSQL via Supabase)
OCR: Tesseract.js + PDF-to-Image
File Upload: Multer (local storage)
No microservices – the entire system is a monolithic backend architecture.

📂 Folder Structure:

/src
  /document       # PDF document management (upload + OCR analysis)
  /invoice        # Invoice management (creation, status updates)
  /income         # Income calculation (monthly/annual turnover & taxes)
  /user           # User management (authentication & relations)
  /ocr            # OCR services (text extraction from PDF)
  /prisma         # Prisma schema & client service
  /uploads        # Uploaded PDF files (via Multer)

🗄️ Database Schema (Prisma)

Model	            Relationships
User	            Has many Documents, Invoices, and Income
Document	        Belongs to User, may create one Income
Invoice	          Belongs to User, may create one Income
Income	          Belongs to User, may link to a Document or Invoice


🚀 Features Overview: Services & Controllers

🏷️ Module 
  Document
  Invoice
  Income
  User
  OCR
  PDF
  Prisma

🎯 Service 
  DocumentsService
  InvoiceService
  IncomeService
  UserService
  OcrService
  PdfService
  PrismaService
  

🗂️ Controller 
  DocumentsController
  InvoiceController
  IncomeController
  UserService

📝 Description
			Upload PDF, extract text via OCR, classify, store metadata, link to income if validated

			Create invoices, update status (ON_HOLD → PAID), generate income records when status changes

			Calculate annual and monthly revenue & taxes per user (linked via userId)

		  User management: registration, login, authentication (currently   basic; can expand to JWT auth)
		
      Extract text from PDF using Tesseract.js

		  Convert PDF to images for OCR processing

		  Database access layer using Prisma ORM




📊 Business Logic

✅ Invoice Flow:

Users can create invoices via the API.
Each invoice is linked to a user via userId.
Once an invoice is marked as PAID, an income record is created with the amount and date.
✅ Document Upload & OCR:

Users can upload PDFs (e.g., invoices or quotes).
The system uses OCR to extract text and metadata (SIRET, totals, dates...).
If a document is validated (status: VALIDATED), its data is stored in the income table.
✅ Income Calculation:

The system calculates revenue and taxes:
Annual and monthly turnover (GET /income/annual-income & GET /income/monthly-income)
Annual and monthly taxes (calculated as 26.1% of revenue)
✅ User-Specific Data:

All documents, invoices, and income records are linked to a specific user via userId.


For JWT Token : 

For JWT token generation, follow the official NestJS documentation.
First, install the JWT package: npm i --save @nestjs/jwt

Then install the config package: npm i --save @nestjs/config

In auth.module.ts, do not add JwtService in the providers array.
Doing so will cause a bug where the private key from jwtConstants is not recognized.
