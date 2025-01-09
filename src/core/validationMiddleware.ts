import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ServiceError } from './serviceError';

/**
 * This middleware checks for validation errors set by express-validator.
 * If errors exist, it throws a ServiceError with a 400 status.
 *
 * Tests:
 * - Submit invalid input to a route that uses validations (e.g., non-int ID).
 * - Expect a 400 with 'Validation failed'.
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ServiceError('Validation failed', 400, errors.array()));
    }
    next();
};
