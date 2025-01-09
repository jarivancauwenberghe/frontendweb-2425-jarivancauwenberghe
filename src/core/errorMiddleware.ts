import { Request, Response, NextFunction } from 'express';
import { ServiceError } from './serviceError';
import logger from './logger';

/**
 * Global error handler.
 * Tests:
 * - Trigger errors from controllers/services and ensure they are formatted correctly.
 * - ServiceError should return statusCode and message.
 * - Other errors return 500 and 'Internal Server Error'.
 */
interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: any;
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ServiceError) {
        logger.warn(`ServiceError: ${err.message}`, { statusCode: err.statusCode, errors: err.errors });
        const response: ErrorResponse = {
            success: false,
            message: err.message,
            errors: err.errors,
        };
        res.status(err.statusCode).json(response);
    } else {
        logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
        const response: ErrorResponse = {
            success: false,
            message: 'Internal Server Error',
        };
        res.status(500).json(response);
    }
};
