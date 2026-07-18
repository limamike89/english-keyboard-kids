import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import express from 'express'
import { AppModule } from '../src/app.module'

let cachedApp: express.Express

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    const server = express()
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { bufferLogs: true })

    app.enableShutdownHooks()
    app.use(helmet())
    app.enableCors({
      origin: process.env.CORS_ORIGINS === '*' ? true : process.env.CORS_ORIGINS?.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-request-id', 'idempotency-key'],
    })
    app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1')
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )

    await app.init()
    cachedApp = server
  }
  cachedApp(req, res)
}
