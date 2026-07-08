import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  // Enable CORS for mobile apps
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-API-Key',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('App Feedback API')
    .setDescription(
      'REST API for collecting app feedback with Telegram notifications. ' +
      'Supports ratings, categories, device info, and comprehensive analytics.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addTag('Feedback', 'Feedback submission and management')
    .addTag('Health', 'API health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'App Feedback API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(port);

  logger.log(`🚀 App Feedback API running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/docs`);
  logger.log(`📡 Telegram notifications: ${configService.get<boolean>('telegram.enabled') ? 'ENABLED' : 'DISABLED'}`);
}

bootstrap();
