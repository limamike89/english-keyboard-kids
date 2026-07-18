import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  public readonly errorCode: string;
  public readonly details?: Array<{ field: string; message: string; code: string }>;

  constructor(
    errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Array<{ field: string; message: string; code: string }>,
  ) {
    super({ errorCode, message, details }, status);
    this.errorCode = errorCode;
    this.details = details;
  }
}
