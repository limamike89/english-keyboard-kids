import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ValidationException extends AppException {
  constructor(
    message: string,
    details?: Array<{ field: string; message: string; code: string }>,
  ) {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, details);
  }
}
