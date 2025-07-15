import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Centralized error handling utilities
 * Provides consistent error responses and logging
 */

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createErrorResponse(error: unknown, defaultMessage: string = 'Internal server error'): NextResponse {
  if (error instanceof AppError) {
    logger.error(`API Error: ${error.message}`, error, { code: error.code });
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && error.details && { details: error.details }),
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`, error);
    return NextResponse.json(
      {
        error: defaultMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: 500 }
    );
  }

  logger.error('Unknown error occurred', error);
  return NextResponse.json(
    {
      error: defaultMessage,
      ...(process.env.NODE_ENV === 'development' && { details: String(error) }),
    },
    { status: 500 }
  );
}

export function handleDatabaseError(error: any, operation: string): AppError {
  logger.error(`Database error during ${operation}`, error);
  
  // Common database error codes
  if (error.code === 'PGRST116') {
    return new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  if (error.code === '23505') {
    return new AppError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
  }
  
  if (error.code === '23503') {
    return new AppError('Referenced resource not found', 400, 'INVALID_REFERENCE');
  }

  return new AppError(`Database operation failed: ${operation}`, 500, 'DATABASE_ERROR', error);
}

export function handleAuthError(error: any): AppError {
  logger.error('Authentication error', error);
  return new AppError('Authentication required', 401, 'AUTH_REQUIRED');
}

export function handleValidationError(message: string, field?: string): AppError {
  return new AppError(`Validation failed: ${message}`, 400, 'VALIDATION_ERROR', { field });
}