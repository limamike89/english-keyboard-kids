import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(entity: string, id?: string) {
    const message = id ? `${entity} with id '${id}' not found` : `${entity} not found`;
    super(`${entity.toUpperCase()}_NOT_FOUND`, message, HttpStatus.NOT_FOUND);
  }
}
