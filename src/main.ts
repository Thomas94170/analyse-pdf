import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://si-front-x8bk.vercel.app',
      'https://www.si-front-x8bk.vercel.app',
      'https://si-front-x8bk-3nqqldvye-thomas94170s-projects.vercel.app',
      'https://si-front-x8bk-knu2do7s6-thomas94170s-projects.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('running on PORT, ', process.env.PORT ?? 3000);
  console.log('running on db, ', process.env.DATABASE_URL);
  console.log(process.env.JWT_SECRET);
  console.log(process.env.DATABASE_URL);
}
bootstrap();
