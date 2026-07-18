import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      success: false as const,
      error: {
        code: 'HTTP_ERROR',
        message: exception.message || 'Internal server error',
        details: null as Array<{ field: string; message: string; code: string }> | null,
      },
      timestamp: new Date().toISOString(),
    };

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      errorBody.error.code = (resp.errorCode as string) || `HTTP_${status}`;
      errorBody.error.message = (resp.message as string) || errorBody.error.message;
      errorBody.error.details = (resp.details as Array<{
        field: string;
        message: string;
        code: string;
      }>) || null;
    }

    response.status(status).json(errorBody);
  }
}
