import type { NextFunction, Request, Response } from 'express';
import map from 'lodash/map';

import type { ApiErrorResponse } from '@/src/modules/common/common.type';

const formatErrorMessage = (err: ApiErrorResponse) => {
  const message = err?.message?.replaceAll?.(' ', '_');

  const errors = map(err?.errors, (issue) => ({
    field: issue.path?.join('.'),
    code: issue.code?.toUpperCase(),
    message: issue.message
  }));

  return {
    message: message?.toUpperCase?.() || 'SERVER_ERROR',
    ...(errors.length > 0 && { errors })
  };
};

const errorHandler = (err: ApiErrorResponse, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return;
  }

  return res.status(err?.statusCode || 500).json(formatErrorMessage(err));
};

export default errorHandler;
