import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { ServiceError } from './serviceError';
import config from 'config';

// Interface for decoded token payload
interface DecodedToken {
    id: number;
    role: string;
    // Add other token fields if needed
}

/**
 * Generate a JWT token with configurable expiration.
 * Tests:
 * - Generate token with valid payload (expect a JWT string).
 * - Test with different expiresIn values.
 * - Possibly mock config or invalid secret scenario in unit tests.
 */
export function generateToken(payload: object, expiresIn: string | number = '1h'): string {
    return jwt.sign(payload, config.get<string>('auth.jwt.secret'), {
        expiresIn: expiresIn,
        audience: config.get<string>('auth.jwt.audience'),
        issuer: config.get<string>('auth.jwt.issuer'),
    });
}

/**
 * Middleware to verify JWT token from Authorization header.
 * Tests:
 * - No authorization header (expect 401).
 * - Header without Bearer scheme (expect 401).
 * - Invalid or expired token (expect 401).
 * - Valid token and proceed to next middleware (expect success).
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(ServiceError.unauthorized('Authorization token missing'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, config.get<string>('auth.jwt.secret'), {
            audience: config.get<string>('auth.jwt.audience'),
            issuer: config.get<string>('auth.jwt.issuer'),
        }) as DecodedToken;

        (req as any).user = decodedToken;
        next();
    } catch (err) {
        // Tests: Provide an invalid or expired token to trigger this path.
        next(ServiceError.unauthorized('Invalid or expired token'));
    }
}

/**
 * Helper to hash passwords using bcrypt.
 * Tests:
 * - Verify that hashing returns a string.
 * - Check different passwords produce different hashes.
 * - (Unit test) Mock bcrypt to simulate errors.
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; 
    return await bcrypt.hash(password, saltRounds);
}
