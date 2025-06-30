import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}; 