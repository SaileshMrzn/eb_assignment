import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ensure uploads folder exists
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  // graphql-upload middleware (max size 10MB, maxFiles 1)
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));

  // serve static files from /uploads
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
