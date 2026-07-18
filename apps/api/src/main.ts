import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getEnvValue } from './config/env.config';
import { APP_NAME, APP_VERSION } from './common/constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  app.use(helmet());

  app.enableCors({
    origin: getEnvValue('CORS_ORIGINS') === '*' ? true : getEnvValue('CORS_ORIGINS').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-request-id', 'idempotency-key'],
  });

  const apiPrefix = getEnvValue('API_PREFIX');
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (getEnvValue('SWAGGER_ENABLED')) {
    const config = new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription('Educational API for kids learning English through auditory recognition')
      .setVersion(APP_VERSION)
      .addServer(`http://localhost:${getEnvValue('PORT')}`, 'Development')
      .addApiKey(
        { type: 'apiKey', in: 'header', name: 'x-session-token', description: 'Anonymous session token' },
        'session-token',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT token (future)' },
        'jwt',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(getEnvValue('SWAGGER_PATH'), app, document, {
      swaggerUiEnabled: true,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
    });
  }

  const port = getEnvValue('PORT');
  const host = getEnvValue('HOST');

  await app.listen(port, host);

  const logger = app.get(Logger);
  logger.log(`Application is running on http://${host}:${port}/${apiPrefix}`);
  logger.log(`Swagger docs at http://${host}:${port}/${getEnvValue('SWAGGER_PATH')}`);
}

bootstrap();
