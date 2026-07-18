import { PaginationMeta } from './pagination.dto';

export class ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;

  constructor(data: T, meta?: PaginationMeta) {
    this.success = true as const;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

export class ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string; code: string }>;
  };
  timestamp: string;

  constructor(
    code: string,
    message: string,
    details?: Array<{ field: string; message: string; code: string }>,
  ) {
    this.success = false as const;
    this.error = { code, message, details };
    this.timestamp = new Date().toISOString();
  }
}
