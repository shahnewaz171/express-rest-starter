import type { Request, Response } from 'express';

interface Error {
  statusCode?: number;
  message?: string;
}

const errorHandler = (err: Error, _req: Request, res: Response) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    errors: {}
  });
};

export default errorHandler;
