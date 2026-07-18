import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'DATABASE_ERROR';
    let message = 'A database error occurred';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE_ENTRY';
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `Duplicate value for ${target}`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = exception.meta?.cause as string || 'Record not found';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY_ERROR';
        message = 'Referenced record does not exist';
        break;
      }
      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        code = 'RELATION_ERROR';
        message = 'Invalid relation constraint';
        break;
      }
    }

    response.status(status).json({
      success: false as const,
      error: { code, message, details: null },
      timestamp: new Date().toISOString(),
    });
  }
}
