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
    app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

    const corsOrigin = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS === '*'
        ? true
        : process.env.CORS_ORIGINS.split(',')
      : true

    app.enableCors({
      origin: corsOrigin,
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

    try {
      await app.init()
      cachedApp = server
    } catch (err) {
      console.error('[serverless] NestJS init failed:', err)
      res.status(500).json({ error: 'App initialization failed', message: (err as Error).message })
      return
    }
  }
  cachedApp(req, res)
}
