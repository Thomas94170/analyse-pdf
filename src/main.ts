import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('running on PORT, ', process.env.PORT ?? 3000);
  console.log('running on db, ', process.env.DATABASE_URL);
  console.log(process.env.JWT_SECRET);
  console.log(process.env.DATABASE_URL);
}
bootstrap();
