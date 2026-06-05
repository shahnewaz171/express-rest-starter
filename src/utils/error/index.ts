import type { ZodCustomError } from '@/src/modules/common/common.type';

class CustomError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors as ZodCustomError;

    this.name = 'CustomError';

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export { CustomError };
