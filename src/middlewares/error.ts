import type { NextFunction, Request, Response } from 'express';

interface AppError {
  statusCode?: number;
  message?: string;
}

const formatErrorMessage = (str?: string) => {
  const message = str?.replaceAll?.(' ', '_');
  return message?.toUpperCase?.();
};

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return;
  }

  return res.status(err?.statusCode || 500).json({
    message: formatErrorMessage(err?.message || 'SERVER_ERROR')
  });
};

export default errorHandler;
