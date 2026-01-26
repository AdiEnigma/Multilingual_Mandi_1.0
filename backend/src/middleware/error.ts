import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error classes
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string) {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    
    switch (error.code) {
      case 'P2002':
        message = 'A record with this information already exists';
        details = { constraint: error.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        break;
      default:
        message = 'Database operation failed';
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'Unknown database error occurred';
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'Database engine error';
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'Database connection failed';
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
    message = 'Invalid data provided';
  }

  // Log error
  logger.error('Request error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    statusCode,
    code,
  });

  // Send error response
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Add details in development or for validation errors
  if (details || process.env.NODE_ENV === 'development') {
    errorResponse.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error helper
export const createValidationError = (field: string, message: string) => {
  const error = new ValidationError(`Validation failed for ${field}`);
  return error;
};

// Database error helper
export const handleDatabaseError = (error: any, operation: string) => {
  logger.error(`Database ${operation} failed`, {
    error: error.message,
    stack: error.stack,
  });

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictError('A record with this information already exists');
      case 'P2025':
        throw new NotFoundError('Record not found');
      case 'P2003':
        throw new ValidationError('Invalid reference provided');
      default:
        throw new AppError('Database operation failed', 500, 'DATABASE_ERROR');
    }
  }

  throw new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};